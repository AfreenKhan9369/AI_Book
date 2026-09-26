import { Response } from "express";
import { getDatabase } from "../config/db.js";
import { AuthRequest } from "../middleware/auth.js";
import {
  testSupabaseConnection,
  storeRegistrationInSupabase,
  getSupabase,
  parseAvatarUrl,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
} from "../config/supabase.js";

export async function getStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { branch, semester, search } = req.query;
    const db = await getDatabase();

    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.branch, u.semester, u.roll_number, u.created_at,
             u.supabase_user_id, u.supabase_synced, u.supabase_synced_at,
             (SELECT COUNT(*) FROM bookmarks b WHERE b.user_id = u.id) as saved_notes_count,
             (SELECT COUNT(*) FROM quiz_history q WHERE q.user_id = u.id) as quizzes_taken
      FROM users u
      WHERE u.role = 'student'
    `;
    const params: any[] = [];

    if (branch && branch !== "All") {
      sql += " AND u.branch = ?";
      params.push(branch);
    }

    if (semester && semester !== "all") {
      sql += " AND u.semester = ?";
      params.push(parseInt(semester as string, 10));
    }

    if (search) {
      const term = `%${(search as string).trim()}%`;
      sql += " AND (u.name LIKE ? OR u.email LIKE ? OR u.roll_number LIKE ?)";
      params.push(term, term, term);
    }

    sql += " ORDER BY u.semester ASC, u.name ASC;";

    const students = await db.query(sql, params);
    res.json(students);
  } catch (error: any) {
    console.error("[Users] getStudents error:", error);
    res.status(500).json({ message: "Failed to fetch student directory." });
  }
}

export async function getSupabaseStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const testResult = await testSupabaseConnection();
    const db = await getDatabase();
    const supabase = getSupabase();

    // Query live count from Supabase registrations table
    let supabaseLiveCount = 0;
    try {
      const { count } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true });
      supabaseLiveCount = count || 0;
    } catch {
      // ignore
    }

    const stats = await db.getOne<{ total: number; synced: number }>(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN supabase_synced = 1 THEN 1 ELSE 0 END) as synced 
       FROM users;`
    );

    res.json({
      connected: testResult.connected,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs: testResult.latencyMs,
      message: testResult.message,
      totalUsers: stats?.total || 0,
      syncedUsers: stats?.synced || 0,
      supabaseLiveCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Users] getSupabaseStatus error:", error);
    res.status(500).json({
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      message: error.message || "Failed to query Supabase status",
    });
  }
}

export async function getSupabaseRegistrations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const supabase = getSupabase();
    // Try fetching live registrations from Supabase cloud database
    try {
      const { data: supaUsers, error: supaError } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!supaError && supaUsers && supaUsers.length > 0) {
        const sanitized = supaUsers.map((u: any) => ({
          ...u,
          avatar_url: parseAvatarUrl(u.avatar_url || "").avatarUrl,
        }));
        res.json(sanitized);
        return;
      }
    } catch (e: any) {
      console.warn("[Users] Live Supabase query fallback:", e.message);
    }

    // Fallback to local users list if Supabase table is empty or error
    const db = await getDatabase();
    const users = await db.query(`
      SELECT id, name, email, role, branch, semester, roll_number, avatar,
             supabase_user_id, supabase_synced, supabase_synced_at, created_at
      FROM users
      ORDER BY id DESC;
    `);

    const sanitizedUsers = (users || []).map((u: any) => ({
      ...u,
      avatar_url: parseAvatarUrl(u.avatar || "").avatarUrl,
    }));

    res.json(sanitizedUsers);
  } catch (error: any) {
    console.error("[Users] getSupabaseRegistrations error:", error);
    res.status(500).json({ message: "Failed to fetch registrations." });
  }
}

export async function syncAllToSupabase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const unsyncedUsers = await db.query(`
      SELECT id, name, email, role, branch, semester, roll_number
      FROM users
      WHERE supabase_synced = 0 OR supabase_synced IS NULL;
    `);

    let syncedCount = 0;
    const errors: string[] = [];

    for (const u of unsyncedUsers) {
      const result = await storeRegistrationInSupabase({
        name: u.name,
        email: u.email,
        role: u.role as "student" | "faculty",
        branch: u.branch,
        semester: u.semester,
        roll_number: u.roll_number,
      });

      if (result.success) {
        syncedCount++;
        await db.execute(
          `UPDATE users SET supabase_user_id = ?, supabase_synced = 1, supabase_synced_at = ? WHERE id = ?;`,
          [result.supabaseUserId || "", new Date().toISOString(), u.id]
        );
      } else {
        errors.push(`${u.email}: ${result.message}`);
      }
    }

    res.json({
      message: `Synced ${syncedCount} of ${unsyncedUsers.length} user accounts to Supabase.`,
      syncedCount,
      totalUnsynced: unsyncedUsers.length,
      errors: errors.slice(0, 5),
    });
  } catch (error: any) {
    console.error("[Users] syncAllToSupabase error:", error);
    res.status(500).json({ message: "Failed to execute Supabase sync." });
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (req.user?.id === parseInt(id, 10)) {
      res.status(400).json({ message: "You cannot delete your own account." });
      return;
    }

    const db = await getDatabase();
    const target = await db.getOne("SELECT id, email FROM users WHERE id = ?;", [id]);
    await db.execute("DELETE FROM bookmarks WHERE user_id = ?;", [id]);
    await db.execute("DELETE FROM quiz_history WHERE user_id = ?;", [id]);
    await db.execute("DELETE FROM users WHERE id = ?;", [id]);
    if (target?.email) {
      await db.execute("DELETE FROM users WHERE email = ?;", [target.email]);
    }

    res.json({ message: "User deleted successfully." });
  } catch (error: any) {
    console.error("[Users] deleteUser error:", error);
    res.status(500).json({ message: "Failed to delete user." });
  }
}
