import path from "node:path";
import fs from "node:fs";
import { getSupabase, parseAvatarUrl, formatAvatarUrl } from "./supabase.js";

const safeRun = (promiseLike: any) => {
  Promise.resolve(promiseLike).catch(() => {});
};

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ insertId?: number | string; changes?: number }>;
  getOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  type: "supabase" | "mysql";
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

export async function getDatabase(): Promise<DatabaseAdapter> {
  if (dbInstance) return dbInstance;

  // 1. MySQL (optional, if MYSQL_HOST configured)
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
      console.warn("[DB] MySQL connection failed. Proceeding with Supabase PostgreSQL:", err);
    }
  }

  // 2. Supabase PostgreSQL primary engine (Zero SQLite dependencies)
  console.log("[DB] Initializing AI_Book Supabase PostgreSQL Database Engine...");

  let cacheDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  } catch {
    cacheDir = path.join("/tmp", "data");
    if (!fs.existsSync(cacheDir)) {
      try {
        fs.mkdirSync(cacheDir, { recursive: true });
      } catch {}
    }
  }
  const cachePath = path.join(cacheDir, "supabase_cache.json");

  const tables: Record<string, any[]> = {
    users: [],
    subjects: [],
    materials: [],
    bookmarks: [],
    quiz_history: [],
  };

  const loadLocalCache = () => {
    try {
      if (fs.existsSync(cachePath)) {
        const parsed = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
        for (const [key, val] of Object.entries(parsed)) {
          if (Array.isArray(val) && val.length > 0) {
            tables[key] = val;
          }
        }
      }
    } catch {}
  };

  const saveLocalCache = () => {
    try {
      fs.writeFileSync(cachePath, JSON.stringify(tables, null, 2));
    } catch {}
  };

  loadLocalCache();

  // Hydrate tables directly from Supabase PostgreSQL
  const supabase = getSupabase();
  try {
    const [subRes, matRes, regRes, bmRes, qhRes] = await Promise.allSettled([
      supabase.from("subjects").select("*"),
      supabase.from("materials").select("*"),
      supabase.from("registrations").select("*"),
      supabase.from("bookmarks").select("*"),
      supabase.from("quiz_history").select("*"),
    ]);

    if (subRes.status === "fulfilled" && subRes.value.data && subRes.value.data.length > 0) {
      tables.subjects = subRes.value.data;
    }
    if (matRes.status === "fulfilled" && matRes.value.data && matRes.value.data.length > 0) {
      tables.materials = matRes.value.data;
    }
    if (bmRes.status === "fulfilled" && bmRes.value.data && bmRes.value.data.length > 0) {
      tables.bookmarks = bmRes.value.data;
    }
    if (qhRes.status === "fulfilled" && qhRes.value.data && qhRes.value.data.length > 0) {
      tables.quiz_history = qhRes.value.data;
    }

    if (regRes.status === "fulfilled" && regRes.value.data && Array.isArray(regRes.value.data)) {
      const liveSupaEmails = new Set(regRes.value.data.map((r: any) => String(r.email || "").toLowerCase().trim()));

      // 1. Prune local cache users that were deleted from Supabase (preserving built-in demo accounts)
      tables.users = (tables.users || []).filter((u) => {
        const uEmail = String(u.email || "").toLowerCase().trim();
        if (uEmail === "faculty@college.edu" || uEmail === "student@college.edu") return true;
        return liveSupaEmails.has(uEmail);
      });

      // 2. Add or update users from Supabase registrations
      const existingUserMap = new Map(tables.users.map((u) => [String(u.email || "").toLowerCase().trim(), u]));
      let nextId = tables.users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1;

      for (const reg of regRes.value.data) {
        const regEmail = String(reg.email || "").toLowerCase().trim();
        const { passwordHash, avatarUrl } = parseAvatarUrl(reg.avatar_url || "");

        if (existingUserMap.has(regEmail)) {
          const current = existingUserMap.get(regEmail)!;
          current.name = reg.name || current.name;
          current.role = reg.role || current.role;
          current.branch = reg.branch || current.branch;
          current.semester = reg.semester || current.semester;
          current.roll_number = reg.roll_number ?? current.roll_number;
          current.avatar = avatarUrl || current.avatar;
          // Preserve valid local password hash; only populate if current is empty
          if (passwordHash && !current.password) {
            current.password = passwordHash;
          }
          current.supabase_user_id = reg.auth_user_id || reg.id;
          current.supabase_synced = 1;
        } else {
          tables.users.push({
            id: nextId++,
            name: reg.name,
            email: regEmail,
            password: passwordHash || "",
            role: reg.role || "student",
            branch: reg.branch || "Computer Science",
            semester: reg.semester || 1,
            roll_number: reg.roll_number || "",
            avatar: avatarUrl || "",
            supabase_user_id: reg.auth_user_id || reg.id,
            supabase_synced: 1,
            supabase_synced_at: reg.updated_at || reg.created_at,
            created_at: reg.created_at,
          });
        }
      }
    }

    saveLocalCache();
    console.log(
      `[DB] Supabase PostgreSQL sync complete: ${tables.subjects.length} subjects, ${tables.materials.length} materials, ${tables.users.length} users`
    );
  } catch (err: any) {
    console.warn("[DB] Non-blocking notice during Supabase PostgreSQL sync:", err.message);
  }

  dbInstance = {
    type: "supabase",

    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
      const cleanParams = normalizeParams(params);
      const cleanSql = sql.trim();

      // 1. COUNT(*) queries
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

      // 2. SUM(downloads_count)
      if (/SUM\(downloads_count\)/i.test(cleanSql)) {
        const total = (tables.materials || []).reduce((acc, m) => acc + (Number(m.downloads_count) || 0), 0);
        return [{ total_downloads: total }] as unknown as T[];
      }

      // 3. User stats (total & synced)
      if (/COUNT\(\*\)\s+as\s+total.*SUM\(CASE\s+WHEN\s+supabase_synced/i.test(cleanSql)) {
        const total = (tables.users || []).length;
        const synced = (tables.users || []).filter((u) => u.supabase_synced === 1).length;
        return [{ total, synced }] as unknown as T[];
      }

      // 4. Subjects list with notes_count and pyqs_count
      if (/FROM\s+subjects\s+s/i.test(cleanSql) || /FROM\s+subjects/i.test(cleanSql)) {
        let subs = [...(tables.subjects || [])];

        if (/s\.semester\s*=\s*\?/i.test(cleanSql) || /semester\s*=\s*\?/i.test(cleanSql)) {
          const semVal = cleanParams.find((p) => typeof p === "number");
          if (semVal !== undefined) {
            subs = subs.filter((s) => s.semester === semVal);
          }
        }
        if (/s\.branch\s*=\s*\?/i.test(cleanSql) || /branch\s*=\s*\?/i.test(cleanSql)) {
          const branchVal = cleanParams.find((p) => typeof p === "string" && p !== "All");
          if (branchVal !== undefined) {
            subs = subs.filter((s) => s.branch === branchVal);
          }
        }

        subs.sort((a, b) => (a.semester || 0) - (b.semester || 0) || (a.name || "").localeCompare(b.name || ""));

        const mapped = subs.map((s) => {
          const notes = (tables.materials || []).filter((m) => m.subject_id === s.id && m.type === "note").length;
          const pyqs = (tables.materials || []).filter((m) => m.subject_id === s.id && m.type === "pyq").length;
          return {
            ...s,
            notes_count: notes,
            pyqs_count: pyqs,
          };
        });
        return mapped as unknown as T[];
      }

      // 5. Materials list query
      if (/FROM\s+materials/i.test(cleanSql)) {
        let mats = [...(tables.materials || [])];
        const subMap = new Map((tables.subjects || []).map((s) => [s.id, s]));

        if (/m\.type\s*=\s*\?/i.test(cleanSql)) {
          const typeVal = cleanParams[0];
          if (typeVal && typeVal !== "all") {
            mats = mats.filter((m) => m.type === typeVal);
          }
        }
        if (/m\.semester\s*=\s*\?/i.test(cleanSql)) {
          const semVal = cleanParams.find((p, idx) => /semester\s*=\s*\?/i.test(cleanSql.slice(0, cleanSql.indexOf("?") * (idx + 1))));
          if (semVal) mats = mats.filter((m) => m.semester === semVal);
        }
        if (/m\.subject_id\s*=\s*\?/i.test(cleanSql)) {
          const subId = cleanParams.find((p) => typeof p === "number");
          if (subId) mats = mats.filter((m) => m.subject_id === subId);
        }
        if (/m\.branch\s*=\s*\?/i.test(cleanSql)) {
          const bVal = cleanParams.find((p) => typeof p === "string" && p !== "all" && p !== "All");
          if (bVal) mats = mats.filter((m) => m.branch === bVal);
        }

        // Sort
        if (/downloads_count\s+DESC/i.test(cleanSql)) {
          mats.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
        } else if (/views_count\s+DESC/i.test(cleanSql)) {
          mats.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        } else {
          mats.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        }

        // Limit
        const limitMatch = cleanSql.match(/LIMIT\s+([0-9]+)/i);
        if (limitMatch) {
          mats = mats.slice(0, parseInt(limitMatch[1], 10));
        }

        const enriched = mats.map((m) => {
          const sub = subMap.get(m.subject_id);
          return {
            ...m,
            subject_name: sub?.name || "",
            subject_code: sub?.code || "",
            is_bookmarked: (tables.bookmarks || []).some((b) => b.material_id === m.id) ? 1 : 0,
          };
        });
        return enriched as unknown as T[];
      }

      // 6. Users list query
      if (/FROM\s+users/i.test(cleanSql)) {
        let users = [...(tables.users || [])];
        if (/WHERE\s+u?\.?role\s*=\s*'student'/i.test(cleanSql)) {
          users = users.filter((u) => u.role === "student");
        }
        if (/ORDER\s+BY\s+id\s+DESC/i.test(cleanSql)) {
          users.sort((a, b) => (b.id || 0) - (a.id || 0));
        }
        return users as unknown as T[];
      }

      // 7. Quiz history
      if (/FROM\s+quiz_history/i.test(cleanSql)) {
        let history = [...(tables.quiz_history || [])];
        if (/WHERE\s+user_id\s*=\s*\?/i.test(cleanSql) && cleanParams[0] != null) {
          history = history.filter((q) => q.user_id === cleanParams[0] || String(q.user_id) === String(cleanParams[0]));
        }
        history.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        return history.slice(0, 10) as unknown as T[];
      }

      // 8. Bookmarks
      if (/FROM\s+bookmarks/i.test(cleanSql)) {
        let bms = [...(tables.bookmarks || [])];
        if (/WHERE\s+user_id\s*=\s*\?/i.test(cleanSql) && cleanParams[0] != null) {
          bms = bms.filter((b) => b.user_id === cleanParams[0] || String(b.user_id) === String(cleanParams[0]));
        }
        return bms as unknown as T[];
      }

      return [] as T[];
    },

    async getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
      const cleanParams = normalizeParams(params);
      const cleanSql = sql.trim();

      // Find user by email
      if (/FROM\s+users\s+WHERE\s+email\s*=\s*\?/i.test(cleanSql) && cleanParams[0]) {
        const email = String(cleanParams[0]).toLowerCase().trim();
        const found = (tables.users || []).find((u) => u.email?.toLowerCase().trim() === email);
        if (found) return found as T;

        // Try direct Supabase query
        try {
          const { data } = await supabase.from("registrations").select("*").eq("email", email).maybeSingle();
          if (data) {
            const nextId = (tables.users || []).length + 1;
            const { passwordHash, avatarUrl } = parseAvatarUrl(data.avatar_url || "");
            const mappedUser = {
              id: nextId,
              name: data.name,
              email: String(data.email || "").toLowerCase().trim(),
              password: passwordHash || "",
              role: data.role || "student",
              branch: data.branch || "Computer Science",
              semester: data.semester || 1,
              roll_number: data.roll_number || "",
              avatar: avatarUrl || "",
              supabase_user_id: data.auth_user_id || data.id,
              supabase_synced: 1,
              supabase_synced_at: data.updated_at || data.created_at,
              created_at: data.created_at,
            };
            tables.users.push(mappedUser);
            saveLocalCache();
            return mappedUser as unknown as T;
          }
        } catch {}
        return null;
      }

      // Find user by ID
      if (/FROM\s+users\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql) && cleanParams[0] != null) {
        const idVal = cleanParams[0];
        const found = (tables.users || []).find((u) => u.id === idVal || String(u.id) === String(idVal));
        return (found as T) || null;
      }

      // Find subject by code
      if (/FROM\s+subjects\s+WHERE\s+code\s*=\s*\?/i.test(cleanSql) && cleanParams[0]) {
        const code = String(cleanParams[0]).toUpperCase().trim();
        const found = (tables.subjects || []).find((s) => s.code?.toUpperCase().trim() === code);
        return (found as T) || null;
      }

      // Find subject by ID
      if (/FROM\s+subjects\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql) && cleanParams[0] != null) {
        const idVal = cleanParams[0];
        const found = (tables.subjects || []).find((s) => s.id === idVal || Number(s.id) === Number(idVal));
        return (found as T) || null;
      }

      // Find material by ID
      if (/FROM\s+materials/i.test(cleanSql) && /WHERE\s+(?:m\.)?id\s*=\s*\?/i.test(cleanSql) && cleanParams[0] != null) {
        const idVal = cleanParams[0];
        const found = (tables.materials || []).find((m) => m.id === idVal || Number(m.id) === Number(idVal));
        if (found) {
          const sub = (tables.subjects || []).find((s) => s.id === found.subject_id);
          return {
            ...found,
            subject_name: sub?.name || "",
            subject_code: sub?.code || "",
            is_bookmarked: (tables.bookmarks || []).some((b) => b.material_id === found.id) ? 1 : 0,
          } as unknown as T;
        }
        return null;
      }

      // Find bookmark
      if (/FROM\s+bookmarks\s+WHERE\s+user_id\s*=\s*\?\s+AND\s+material_id\s*=\s*\?/i.test(cleanSql)) {
        const userId = cleanParams[0];
        const matId = cleanParams[1];
        const found = (tables.bookmarks || []).find(
          (b) => (b.user_id === userId || String(b.user_id) === String(userId)) && (b.material_id === matId || Number(b.material_id) === Number(matId))
        );
        return (found as T) || null;
      }

      const rows = await this.query<T>(sql, params);
      return rows && rows.length > 0 ? rows[0] : null;
    },

    async execute(sql: string, params: any[] = []): Promise<{ insertId?: number | string; changes?: number }> {
      const cleanParams = normalizeParams(params);
      const cleanSql = sql.trim();

      // INSERT INTO users
      if (/INSERT\s+INTO\s+users/i.test(cleanSql)) {
        const [name, email, password, role, branch, semester, roll_number, supabase_user_id, supabase_synced, supabase_synced_at] = cleanParams;
        const newId = (tables.users || []).reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1;
        const newUser = {
          id: newId,
          name: name || "",
          email: String(email || "").toLowerCase().trim(),
          password: password || "",
          role: role || "student",
          branch: branch || "Computer Science",
          semester: Number(semester) || 1,
          roll_number: roll_number || "",
          avatar: "",
          supabase_user_id: supabase_user_id || "",
          supabase_synced: supabase_synced ?? 1,
          supabase_synced_at: supabase_synced_at || new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        // Check if user already exists
        const existingIdx = (tables.users || []).findIndex((u) => u.email === newUser.email);
        if (existingIdx >= 0) {
          tables.users[existingIdx] = { ...tables.users[existingIdx], ...newUser, id: tables.users[existingIdx].id };
          saveLocalCache();
          return { insertId: tables.users[existingIdx].id, changes: 1 };
        }

        tables.users.push(newUser);
        saveLocalCache();
        return { insertId: newId, changes: 1 };
      }

      // INSERT INTO subjects
      if (/INSERT\s+INTO\s+subjects/i.test(cleanSql)) {
        const [code, name, branch, semester, description] = cleanParams;
        const newId = (tables.subjects || []).reduce((max, s) => Math.max(max, Number(s.id) || 0), 0) + 1;
        const newSubject = {
          id: newId,
          code: String(code || "").toUpperCase().trim(),
          name: name || "",
          branch: branch || "Computer Science",
          semester: Number(semester) || 1,
          description: description || "",
          created_at: new Date().toISOString(),
        };

        tables.subjects.push(newSubject);
        saveLocalCache();

        // Write directly to Supabase PostgreSQL subjects table
        safeRun(
          supabase
            .from("subjects")
            .upsert([newSubject], { onConflict: "code" })
            .then(({ error }) => {
              if (error) console.warn("[DB] Supabase subjects insert notice:", error.message);
            })
        );

        return { insertId: newId, changes: 1 };
      }

      // INSERT INTO materials
      if (/INSERT\s+INTO\s+materials/i.test(cleanSql)) {
        const newId = (tables.materials || []).reduce((max, m) => Math.max(max, Number(m.id) || 0), 0) + 1;
        const [
          title,
          type,
          subject_id,
          semester,
          branch,
          academic_year,
          module_unit,
          file_name,
          file_path,
          file_size,
          file_type,
          description,
          uploader_id,
          uploader_name,
          downloads_count,
          views_count,
        ] = cleanParams;

        const newMaterial = {
          id: newId,
          title: title || "",
          type: type || "note",
          subject_id: Number(subject_id) || 1,
          semester: Number(semester) || 1,
          branch: branch || "Computer Science",
          academic_year: academic_year || "2024-25",
          module_unit: module_unit || "Unit 1",
          file_name: file_name || "",
          file_path: file_path || "",
          file_size: file_size || "1.2 MB",
          file_type: file_type || "application/pdf",
          description: description || "",
          uploader_id: uploader_id || null,
          uploader_name: uploader_name || "Faculty",
          downloads_count: Number(downloads_count) || 0,
          views_count: Number(views_count) || 0,
          created_at: new Date().toISOString(),
        };

        tables.materials.push(newMaterial);
        saveLocalCache();

        // Sync to Supabase PostgreSQL materials table
        safeRun(
          supabase
            .from("materials")
            .insert([
              {
                title: newMaterial.title,
                type: newMaterial.type,
                subject_id: newMaterial.subject_id,
                semester: newMaterial.semester,
                branch: newMaterial.branch,
                academic_year: newMaterial.academic_year,
                module_unit: newMaterial.module_unit,
                file_name: newMaterial.file_name,
                file_path: newMaterial.file_path,
                file_size: newMaterial.file_size,
                file_type: newMaterial.file_type,
                description: newMaterial.description,
                uploader_name: newMaterial.uploader_name,
                downloads_count: newMaterial.downloads_count,
                views_count: newMaterial.views_count,
              },
            ])
            .then(({ error }) => {
              if (error) console.warn("[DB] Supabase materials sync notice:", error.message);
            })
        );

        return { insertId: newId, changes: 1 };
      }

      // INSERT INTO bookmarks
      if (/INSERT\s+INTO\s+bookmarks/i.test(cleanSql)) {
        const [user_id, material_id] = cleanParams;
        const newId = (tables.bookmarks || []).reduce((max, b) => Math.max(max, Number(b.id) || 0), 0) + 1;
        const newBm = {
          id: newId,
          user_id,
          material_id: Number(material_id),
          created_at: new Date().toISOString(),
        };
        tables.bookmarks.push(newBm);
        saveLocalCache();
        return { insertId: newId, changes: 1 };
      }

      // INSERT INTO quiz_history
      if (/INSERT\s+INTO\s+quiz_history/i.test(cleanSql)) {
        const [user_id, subject_name, topic, score, total_questions] = cleanParams;
        const newId = (tables.quiz_history || []).reduce((max, q) => Math.max(max, Number(q.id) || 0), 0) + 1;
        const newQuiz = {
          id: newId,
          user_id,
          subject_name: subject_name || "General",
          topic: topic || "Practice Quiz",
          score: Number(score) || 0,
          total_questions: Number(total_questions) || 5,
          created_at: new Date().toISOString(),
        };
        tables.quiz_history.push(newQuiz);
        saveLocalCache();
        return { insertId: newId, changes: 1 };
      }

      // UPDATE materials views_count
      if (/UPDATE\s+materials\s+SET\s+views_count\s*=\s*views_count\s*\+\s*1\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const matId = Number(cleanParams[0]);
        const mat = (tables.materials || []).find((m) => m.id === matId);
        if (mat) {
          mat.views_count = (mat.views_count || 0) + 1;
          saveLocalCache();
        }
        return { changes: 1 };
      }

      // UPDATE materials downloads_count
      if (/UPDATE\s+materials\s+SET\s+downloads_count\s*=\s*downloads_count\s*\+\s*1\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const matId = Number(cleanParams[0]);
        const mat = (tables.materials || []).find((m) => m.id === matId);
        if (mat) {
          mat.downloads_count = (mat.downloads_count || 0) + 1;
          saveLocalCache();
        }
        return { changes: 1 };
      }

      // UPDATE users password
      if (/UPDATE\s+users\s+SET\s+password\s*=\s*\?/i.test(cleanSql)) {
        const [pwd, idOrEmail] = cleanParams;
        const u = (tables.users || []).find(
          (user) => user.id === idOrEmail || String(user.id) === String(idOrEmail) || user.email === String(idOrEmail).toLowerCase().trim()
        );
        if (u) {
          u.password = pwd;
          saveLocalCache();

          if (u.email) {
            const rawAvatar = formatAvatarUrl(pwd, u.avatar || "");
            safeRun(
              supabase
                .from("registrations")
                .update({ avatar_url: rawAvatar })
                .eq("email", u.email.toLowerCase().trim())
            );
          }
        }
        return { changes: 1 };
      }

      // UPDATE users profile
      if (/UPDATE\s+users\s+SET\s+name\s*=\s*\?/i.test(cleanSql)) {
        const [name, branch, semester, roll_number, avatar, id] = cleanParams;
        const u = (tables.users || []).find((user) => user.id === id || String(user.id) === String(id));
        if (u) {
          if (name) u.name = name;
          if (branch) u.branch = branch;
          if (semester) u.semester = semester;
          if (roll_number !== undefined) u.roll_number = roll_number;
          if (avatar !== undefined) u.avatar = avatar;
          saveLocalCache();

          // Sync to Supabase registrations table while preserving password hash in avatar_url
          if (u.email) {
            const rawAvatar = formatAvatarUrl(u.password || "", u.avatar || "");
            safeRun(
              supabase
                .from("registrations")
                .update({
                  name: u.name,
                  branch: u.branch,
                  semester: u.semester,
                  roll_number: u.roll_number,
                  avatar_url: rawAvatar,
                  updated_at: new Date().toISOString(),
                })
                .eq("email", u.email.toLowerCase().trim())
            );
          }
        }
        return { changes: 1 };
      }

      // DELETE FROM bookmarks
      if (/DELETE\s+FROM\s+bookmarks/i.test(cleanSql)) {
        if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
          const idVal = cleanParams[0];
          tables.bookmarks = (tables.bookmarks || []).filter((b) => b.id !== idVal && Number(b.id) !== Number(idVal));
        } else if (/WHERE\s+user_id\s*=\s*\?/i.test(cleanSql)) {
          const uId = cleanParams[0];
          tables.bookmarks = (tables.bookmarks || []).filter((b) => b.user_id !== uId && String(b.user_id) !== String(uId));
        } else if (/WHERE\s+material_id\s*=\s*\?/i.test(cleanSql)) {
          const mId = cleanParams[0];
          tables.bookmarks = (tables.bookmarks || []).filter((b) => b.material_id !== mId && Number(b.material_id) !== Number(mId));
        }
        saveLocalCache();
        return { changes: 1 };
      }

      // DELETE FROM materials
      if (/DELETE\s+FROM\s+materials\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const matId = Number(cleanParams[0]);
        tables.materials = (tables.materials || []).filter((m) => m.id !== matId);
        saveLocalCache();
        return { changes: 1 };
      }

      // DELETE FROM subjects
      if (/DELETE\s+FROM\s+subjects\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
        const subId = Number(cleanParams[0]);
        tables.subjects = (tables.subjects || []).filter((s) => s.id !== subId);
        saveLocalCache();
        return { changes: 1 };
      }

      // DELETE FROM users
      if (/DELETE\s+FROM\s+users/i.test(cleanSql)) {
        if (/WHERE\s+email\s*=\s*\?/i.test(cleanSql)) {
          const emailVal = String(cleanParams[0]).toLowerCase().trim();
          tables.users = (tables.users || []).filter((u) => u.email?.toLowerCase().trim() !== emailVal);
          saveLocalCache();
          safeRun(
            supabase
              .from("registrations")
              .delete()
              .eq("email", emailVal)
          );
          return { changes: 1 };
        }

        if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
          const uId = cleanParams[0];
          const target = (tables.users || []).find((u) => u.id === uId || String(u.id) === String(uId));
          tables.users = (tables.users || []).filter((u) => u.id !== uId && String(u.id) !== String(uId));
          saveLocalCache();

          if (target?.email) {
            safeRun(
              supabase
                .from("registrations")
                .delete()
                .eq("email", target.email.toLowerCase().trim())
            );
          }
          return { changes: 1 };
        }
      }

      return { changes: 1 };
    },
  };

  return dbInstance;
}
