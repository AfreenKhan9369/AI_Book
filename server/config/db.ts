import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ insertId?: number; changes?: number }>;
  getOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  type: "mysql" | "sqlite";
}

let dbInstance: DatabaseAdapter | null = null;

// Normalize parameters for sqlite (convert undefined to null, boolean to 0/1)
function normalizeParams(params: any[] = []): any[] {
  return params.map((p) => {
    if (p === undefined) return null;
    if (typeof p === "boolean") return p ? 1 : 0;
    return p;
  });
}

// Convert MySQL syntax to SQLite syntax when running in SQLite mode
function sanitizeSqlForSqlite(sql: string): string {
  return sql
    .replace(/AUTO_INCREMENT/gi, "AUTOINCREMENT")
    .replace(/INT AUTO_INCREMENT/gi, "INTEGER AUTOINCREMENT")
    .replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP")
    .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, "TEXT DEFAULT CURRENT_TIMESTAMP");
}

export async function getDatabase(): Promise<DatabaseAdapter> {
  if (dbInstance) return dbInstance;

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

      // Test connection
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
      console.warn("[DB] MySQL connection failed. Falling back to embedded relational SQL engine:", err);
    }
  }

  // SQLite Relational Database Engine fallback
  let dbDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  } catch (_e) {
    dbDir = path.join("/tmp", "data");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  const dbPath = path.join(dbDir, "aibook.db");
  const sqliteDb = new DatabaseSync(dbPath);

  // Enable WAL mode for performance
  try {
    sqliteDb.exec("PRAGMA journal_mode = WAL;");
    sqliteDb.exec("PRAGMA foreign_keys = ON;");
  } catch (e) {
    // Ignore pragma error if any
  }

  console.log(`[DB] Relational SQL database initialized at ${dbPath}`);

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
