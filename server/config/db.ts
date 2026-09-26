import path from "node:path";
import fs from "node:fs";

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ insertId?: number; changes?: number }>;
  getOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  type: "mysql" | "sqlite" | "memory";
}

let dbInstance: DatabaseAdapter | null = null;

// Normalize parameters (convert undefined to null, boolean to 0/1)
function normalizeParams(params: any[] = []): any[] {
  return params.map((p) => {
    if (p === undefined) return null;
    if (typeof p === "boolean") return p ? 1 : 0;
    return p;
  });
}

function sanitizeSqlForSqlite(sql: string): string {
  return sql
    .replace(/AUTO_INCREMENT/gi, "AUTOINCREMENT")
    .replace(/INT AUTO_INCREMENT/gi, "INTEGER AUTOINCREMENT")
    .replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP")
    .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, "TEXT DEFAULT CURRENT_TIMESTAMP");
}

export async function getDatabase(): Promise<DatabaseAdapter> {
  if (dbInstance) return dbInstance;

  // 1. MySQL (if MYSQL_HOST configured)
  const mysqlHost = process.env.MYSQL_HOST;
  if (mysqlHost) {
    try {
      const mysql = await import("mysql2/promise");
      const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || "3306", 10),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      const connection = await pool.getConnection();
      connection.release();
      console.log(`[DB] Connected successfully to MySQL at ${mysqlHost}`);

      dbInstance = {
        type: "mysql",
        async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
          const [rows] = await pool.query(sql, params);
          return rows as T[];
        },
        async execute(sql: string, params: any[] = []): Promise<{ insertId?: number; changes?: number }> {
          const [result] = (await pool.execute(sql, params)) as any;
          return { insertId: result.insertId, changes: result.affectedRows };
        },
        async getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
          const [rows] = (await pool.query(sql, params)) as any[];
          return rows && rows.length > 0 ? (rows[0] as T) : null;
        },
      };
      return dbInstance;
    } catch (err) {
      console.warn("[DB] MySQL connection failed. Falling back to embedded engine:", err);
    }
  }

  // 2. Node.js built-in node:sqlite via dynamic function (invisible to esbuild/Netlify bundlers)
  let sqliteDb: any = null;
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)");
    const sqliteMod = await dynamicImport("node:sqlite");
    if (sqliteMod && sqliteMod.DatabaseSync) {
      let dbDir = path.join(process.cwd(), "data");
      try {
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      } catch {
        dbDir = path.join("/tmp", "data");
        if (!fs.existsSync(dbDir)) {
          try { fs.mkdirSync(dbDir, { recursive: true }); } catch {}
        }
      }
      const dbPath = path.join(dbDir, "aibook.db");
      sqliteDb = new sqliteMod.DatabaseSync(dbPath);
      try {
        sqliteDb.exec("PRAGMA journal_mode = WAL;");
        sqliteDb.exec("PRAGMA foreign_keys = ON;");
      } catch {}
      console.log(`[DB] SQLite database initialized at ${dbPath}`);
    }
  } catch (_e) {
    sqliteDb = null;
  }

  if (sqliteDb) {
    dbInstance = {
      type: "sqlite",
      async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        const sanitizedSql = sanitizeSqlForSqlite(sql);
        const cleanParams = normalizeParams(params);
        const stmt = sqliteDb.prepare(sanitizedSql);
        return stmt.all(...cleanParams) as unknown as T[];
      },
      async execute(sql: string, params: any[] = []): Promise<{ insertId?: number; changes?: number }> {
        const sanitizedSql = sanitizeSqlForSqlite(sql);
        const cleanParams = normalizeParams(params);
        const stmt = sqliteDb.prepare(sanitizedSql);
        const result = stmt.run(...cleanParams);
        return {
          insertId: Number(result.lastInsertRowid),
          changes: Number(result.changes),
        };
      },
      async getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
        const sanitizedSql = sanitizeSqlForSqlite(sql);
        const cleanParams = normalizeParams(params);
        const stmt = sqliteDb.prepare(sanitizedSql);
        const row = stmt.get(...cleanParams);
        return (row as T) || null;
      },
    };
    return dbInstance;
  }

  // 3. Robust In-Memory JSON-backed Relational Store (Fallback for serverless environments)
  console.log("[DB] Using Zero-Dependency Serverless Relational Store");

  let storeDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
  } catch {
    storeDir = path.join("/tmp", "data");
    if (!fs.existsSync(storeDir)) {
      try { fs.mkdirSync(storeDir, { recursive: true }); } catch {}
    }
  }
  const storePath = path.join(storeDir, "serverless_db.json");

  const tables: Record<string, any[]> = {
    users: [],
    subjects: [],
    materials: [],
    bookmarks: [],
    quiz_history: [],
  };

  const loadData = () => {
    try {
      if (fs.existsSync(storePath)) {
        const parsed = JSON.parse(fs.readFileSync(storePath, "utf-8"));
        for (const [key, val] of Object.entries(parsed)) {
          if (Array.isArray(val)) {
            tables[key] = val;
          }
        }
      }
    } catch {}
  };

  const saveData = () => {
    try {
      fs.writeFileSync(storePath, JSON.stringify(tables, null, 2));
    } catch {}
  };

  loadData();

  dbInstance = {
    type: "memory",
    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
      const cleanParams = normalizeParams(params);
      const cleanSql = sql.trim();

      // COUNT(*) query handlers
      if (/SELECT\s+COUNT\(\*\)\s+as\s+count\s+FROM\s+([a-zA-Z0-9_]+)/i.test(cleanSql)) {
        const match = cleanSql.match(/FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?/i);
        if (match) {
          const table = match[1];
          const whereClause = match[2];
          let rows = tables[table] || [];
          if (whereClause) {
            if (/role\s*=\s*'student'/i.test(whereClause)) {
              rows = rows.filter((r) => r.role === "student");
            } else if (/role\s*=\s*'faculty'/i.test(whereClause)) {
              rows = rows.filter((r) => r.role === "faculty");
            } else if (/type\s*=\s*'note'/i.test(whereClause)) {
              rows = rows.filter((r) => r.type === "note");
            } else if (/type\s*=\s*'pyq'/i.test(whereClause)) {
              rows = rows.filter((r) => r.type === "pyq");
            }
          }
          return [{ count: rows.length }] as unknown as T[];
        }
      }

      // SUM(downloads_count)
      if (/SUM\(downloads_count\)/i.test(cleanSql)) {
        const total = (tables.materials || []).reduce((acc, m) => acc + (Number(m.downloads_count) || 0), 0);
        return [{ total_downloads: total }] as unknown as T[];
      }

      // SELECT FROM subjects
      if (/FROM\s+subjects/i.test(cleanSql)) {
        let rows = [...(tables.subjects || [])];
        if (/WHERE\s+semester\s*=\s*\?/i.test(cleanSql) && cleanParams[0] != null) {
          rows = rows.filter((s) => s.semester === cleanParams[0]);
        }
        return rows as unknown as T[];
      }

      // SELECT FROM materials
      if (/FROM\s+materials/i.test(cleanSql)) {
        let rows = [...(tables.materials || [])];
        if (/ORDER\s+BY\s+downloads_count\s+DESC/i.test(cleanSql)) {
          rows.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
        } else {
          rows.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        }
        if (/LIMIT\s+([0-9]+)/i.test(cleanSql)) {
          const limit = parseInt(cleanSql.match(/LIMIT\s+([0-9]+)/i)![1], 10);
          rows = rows.slice(0, limit);
        }
        return rows as unknown as T[];
      }

      // SELECT FROM users
      if (/FROM\s+users/i.test(cleanSql)) {
        let rows = [...(tables.users || [])];
        if (/WHERE\s+role\s*=\s*'student'/i.test(cleanSql)) {
          rows = rows.filter((u) => u.role === "student");
        }
        return rows as unknown as T[];
      }

      // SELECT FROM bookmarks
      if (/FROM\s+bookmarks/i.test(cleanSql)) {
        let rows = [...(tables.bookmarks || [])];
        if (/WHERE\s+user_id\s*=\s*\?/i.test(cleanSql) && cleanParams[0] != null) {
          rows = rows.filter((b) => b.user_id === cleanParams[0]);
        }
        return rows as unknown as T[];
      }

      // SELECT FROM quiz_history
      if (/FROM\s+quiz_history/i.test(cleanSql)) {
        let rows = [...(tables.quiz_history || [])];
        if (/WHERE\s+user_id\s*=\s*\?/i.test(cleanSql) && cleanParams[0] != null) {
          rows = rows.filter((q) => q.user_id === cleanParams[0]);
        }
        return rows as unknown as T[];
      }

      return [] as T[];
    },

    async execute(sql: string, params: any[] = []): Promise<{ insertId?: number; changes?: number }> {
      const cleanParams = normalizeParams(params);
      const cleanSql = sql.trim();

      // CREATE TABLE
      const createMatch = cleanSql.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-zA-Z0-9_]+)/i);
      if (createMatch) {
        const table = createMatch[1];
        if (!tables[table]) tables[table] = [];
        return { changes: 1 };
      }

      // ALTER TABLE
      if (/ALTER\s+TABLE/i.test(cleanSql)) {
        return { changes: 1 };
      }

      // INSERT INTO users
      if (/INSERT\s+INTO\s+users/i.test(cleanSql)) {
        const id = (tables.users.reduce((max, u) => Math.max(max, u.id || 0), 0) || 0) + 1;
        const now = new Date().toISOString();
        const userObj: any = {
          id,
          name: cleanParams[0] || "",
          email: cleanParams[1] || "",
          password: cleanParams[2] || "",
          role: cleanParams[3] || "student",
          branch: cleanParams[4] || "Computer Science",
          semester: cleanParams[5] || 4,
          roll_number: cleanParams[6] || "",
          avatar: cleanParams[7] || "",
          supabase_user_id: cleanParams[8] || "",
          supabase_synced: cleanParams[9] || 0,
          supabase_synced_at: cleanParams[10] || now,
          created_at: now,
        };
        tables.users.push(userObj);
        saveData();
        return { insertId: id, changes: 1 };
      }

      // INSERT INTO subjects
      if (/INSERT\s+INTO\s+subjects/i.test(cleanSql)) {
        const id = (tables.subjects.reduce((max, s) => Math.max(max, s.id || 0), 0) || 0) + 1;
        tables.subjects.push({
          id,
          code: cleanParams[0] || "",
          name: cleanParams[1] || "",
          semester: cleanParams[2] || 1,
          branch: cleanParams[3] || "Engineering",
          description: cleanParams[4] || "",
          created_at: new Date().toISOString(),
        });
        saveData();
        return { insertId: id, changes: 1 };
      }

      // INSERT INTO materials
      if (/INSERT\s+INTO\s+materials/i.test(cleanSql)) {
        const id = (tables.materials.reduce((max, m) => Math.max(max, m.id || 0), 0) || 0) + 1;
        tables.materials.push({
          id,
          title: cleanParams[0] || "",
          type: cleanParams[1] || "note",
          subject_id: cleanParams[2] || 1,
          semester: cleanParams[3] || 1,
          branch: cleanParams[4] || "Engineering",
          academic_year: cleanParams[5] || "2024-25",
          module_unit: cleanParams[6] || "Unit 1",
          file_name: cleanParams[7] || "",
          file_path: cleanParams[8] || "",
          file_size: cleanParams[9] || "1.0 MB",
          file_type: cleanParams[10] || "application/pdf",
          description: cleanParams[11] || "",
          uploader_id: cleanParams[12] || 1,
          uploader_name: cleanParams[13] || "Faculty",
          downloads_count: 0,
          views_count: 0,
          created_at: new Date().toISOString(),
        });
        saveData();
        return { insertId: id, changes: 1 };
      }

      // INSERT INTO bookmarks
      if (/INSERT\s+INTO\s+bookmarks/i.test(cleanSql)) {
        const id = (tables.bookmarks.reduce((max, b) => Math.max(max, b.id || 0), 0) || 0) + 1;
        tables.bookmarks.push({
          id,
          user_id: cleanParams[0],
          material_id: cleanParams[1],
          created_at: new Date().toISOString(),
        });
        saveData();
        return { insertId: id, changes: 1 };
      }

      // INSERT INTO quiz_history
      if (/INSERT\s+INTO\s+quiz_history/i.test(cleanSql)) {
        const id = (tables.quiz_history.reduce((max, q) => Math.max(max, q.id || 0), 0) || 0) + 1;
        tables.quiz_history.push({
          id,
          user_id: cleanParams[0],
          subject_name: cleanParams[1],
          topic: cleanParams[2],
          score: cleanParams[3],
          total_questions: cleanParams[4],
          created_at: new Date().toISOString(),
        });
        saveData();
        return { insertId: id, changes: 1 };
      }

      // UPDATE materials (views or downloads)
      if (/UPDATE\s+materials\s+SET\s+views_count\s*=\s*views_count\s*\+\s*1\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const id = cleanParams[0];
        const item = tables.materials.find((m) => m.id === id);
        if (item) item.views_count = (item.views_count || 0) + 1;
        saveData();
        return { changes: 1 };
      }
      if (/UPDATE\s+materials\s+SET\s+downloads_count\s*=\s*downloads_count\s*\+\s*1\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const id = cleanParams[0];
        const item = tables.materials.find((m) => m.id === id);
        if (item) item.downloads_count = (item.downloads_count || 0) + 1;
        saveData();
        return { changes: 1 };
      }

      // DELETE FROM bookmarks
      if (/DELETE\s+FROM\s+bookmarks\s+WHERE/i.test(cleanSql)) {
        if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
          tables.bookmarks = tables.bookmarks.filter((b) => b.id !== cleanParams[0]);
        } else if (/WHERE\s+material_id\s*=\s*\?/i.test(cleanSql)) {
          tables.bookmarks = tables.bookmarks.filter((b) => b.material_id !== cleanParams[0]);
        }
        saveData();
        return { changes: 1 };
      }

      // DELETE FROM materials
      if (/DELETE\s+FROM\s+materials\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        tables.materials = tables.materials.filter((m) => m.id !== cleanParams[0]);
        saveData();
        return { changes: 1 };
      }

      saveData();
      return { changes: 1 };
    },

    async getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
      const cleanParams = normalizeParams(params);
      const cleanSql = sql.trim();

      // SELECT FROM users WHERE email = ?
      if (/FROM\s+users\s+WHERE\s+email\s*=\s*\?/i.test(cleanSql)) {
        const email = String(cleanParams[0]).toLowerCase().trim();
        const user = tables.users.find((u) => u.email.toLowerCase().trim() === email);
        return (user as T) || null;
      }

      // SELECT FROM users WHERE id = ?
      if (/FROM\s+users\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const id = Number(cleanParams[0]);
        const user = tables.users.find((u) => u.id === id);
        return (user as T) || null;
      }

      // SELECT FROM subjects WHERE code = ?
      if (/FROM\s+subjects\s+WHERE\s+code\s*=\s*\?/i.test(cleanSql)) {
        const code = String(cleanParams[0]).toUpperCase().trim();
        const subject = tables.subjects.find((s) => s.code.toUpperCase().trim() === code);
        return (subject as T) || null;
      }

      // SELECT FROM subjects WHERE id = ?
      if (/FROM\s+subjects\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const id = Number(cleanParams[0]);
        const subject = tables.subjects.find((s) => s.id === id);
        return (subject as T) || null;
      }

      // SELECT FROM materials WHERE id = ?
      if (/FROM\s+materials\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const id = Number(cleanParams[0]);
        const material = tables.materials.find((m) => m.id === id);
        return (material as T) || null;
      }

      // SELECT FROM bookmarks WHERE user_id = ? AND material_id = ?
      if (/FROM\s+bookmarks\s+WHERE\s+user_id\s*=\s*\?\s+AND\s+material_id\s*=\s*\?/i.test(cleanSql)) {
        const uid = cleanParams[0];
        const mid = cleanParams[1];
        const bm = tables.bookmarks.find((b) => b.user_id === uid && b.material_id === mid);
        return (bm as T) || null;
      }

      const rows = await this.query<T>(sql, params);
      return rows && rows.length > 0 ? rows[0] : null;
    },
  };

  return dbInstance;
}
