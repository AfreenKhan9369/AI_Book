import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDatabase } from "../config/db.js";
import { generateToken, AuthRequest } from "../middleware/auth.js";
import { storeRegistrationInSupabase, getSupabase } from "../config/supabase.js";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role = "student", branch = "Computer Science", semester = 4, roll_number = "" } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Please enter a valid email address." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters long." });
      return;
    }

    const db = await getDatabase();
    const cleanEmail = email.toLowerCase().trim();
    const supabase = getSupabase();

    // Check if user exists in local database or Supabase registrations table
    const existing = await db.getOne("SELECT id FROM users WHERE email = ?;", [cleanEmail]);
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    try {
      const { data: existingSupa } = await supabase
        .from("registrations")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingSupa) {
        res.status(409).json({ message: "An account with this email is already registered in Supabase." });
        return;
      }
    } catch {}

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const assignedRole = role === "faculty" || role === "admin" ? "faculty" : "student";

    // 1. Store registration details in Supabase PostgreSQL & Auth
    const supabaseSync = await storeRegistrationInSupabase({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
      branch,
      semester: parseInt(semester, 10) || 1,
      roll_number: roll_number.trim(),
    });

    // 2. Store in database with Supabase sync tracking
    const insertResult = await db.execute(
      `INSERT INTO users (name, email, password, role, branch, semester, roll_number, supabase_user_id, supabase_synced, supabase_synced_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        name.trim(),
        cleanEmail,
        hashedPassword,
        assignedRole,
        branch,
        parseInt(semester, 10) || 1,
        roll_number.trim(),
        supabaseSync.supabaseUserId || "",
        supabaseSync.success ? 1 : 0,
        new Date().toISOString(),
      ]
    );

    const newUserId = insertResult.insertId!;
    const userPayload = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole as "student" | "faculty",
      branch,
      semester: parseInt(semester, 10) || 1,
      roll_number: roll_number.trim(),
      supabase_synced: supabaseSync.success,
      supabase_id: supabaseSync.supabaseUserId || null,
    };

    const token = generateToken(userPayload);

    res.status(201).json({
      message: "Registration successful! Account stored in Supabase PostgreSQL database.",
      token,
      user: userPayload,
      supabase: supabaseSync,
    });
  } catch (error: any) {
    console.error("[Auth] Register error:", error);
    res.status(500).json({ message: error?.message || "Internal server error during registration." });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const db = await getDatabase();
    let user = await db.getOne(
      "SELECT id, name, email, password, role, branch, semester, roll_number, avatar, supabase_user_id, supabase_synced FROM users WHERE email = ?;",
      [email.toLowerCase().trim()]
    );

    if (!user) {
      // Check if user registered directly in Supabase
      try {
        const supabase = getSupabase();
        const { data: supaLogin, error: supaError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });

        if (!supaError && supaLogin?.user) {
          const meta = supaLogin.user.user_metadata || {};
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          const assignedRole = meta.role === "faculty" || meta.role === "admin" ? "faculty" : "student";
          const resInsert = await db.execute(
            `INSERT INTO users (name, email, password, role, branch, semester, roll_number, supabase_user_id, supabase_synced, supabase_synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP);`,
            [
              meta.name || email.split("@")[0],
              email.toLowerCase().trim(),
              hashedPassword,
              assignedRole,
              meta.branch || "Computer Science",
              meta.semester || 4,
              meta.roll_number || "",
              supaLogin.user.id,
            ]
          );
          user = {
            id: resInsert.insertId,
            name: meta.name || email.split("@")[0],
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: assignedRole,
            branch: meta.branch || "Computer Science",
            semester: meta.semester || 4,
            roll_number: meta.roll_number || "",
            avatar: "",
            supabase_user_id: supaLogin.user.id,
            supabase_synced: 1,
          };
        }
      } catch (supaErr) {
        console.warn("[Auth] Supabase fallback login check error:", supaErr);
      }
    }

    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      semester: user.semester,
      roll_number: user.roll_number,
      avatar: user.avatar,
    };

    const token = generateToken(userPayload);

    res.json({
      message: "Login successful!",
      token,
      user: userPayload,
    });
  } catch (error: any) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ message: "Internal server error during login." });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const db = await getDatabase();
    const user = await db.getOne(
      "SELECT id, name, email, role, branch, semester, roll_number, avatar, created_at FROM users WHERE id = ?;",
      [req.user.id]
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get user bookmarks
    const bookmarks = await db.query(
      "SELECT material_id FROM bookmarks WHERE user_id = ?;",
      [req.user.id]
    );
    const bookmarkedIds = bookmarks.map((b) => b.material_id);

    // Get user quiz stats
    const quizStats = await db.query(
      "SELECT COUNT(*) as count, AVG(score * 100.0 / total_questions) as avg_score FROM quiz_history WHERE user_id = ?;",
      [req.user.id]
    );

    res.json({
      user,
      bookmarkedIds,
      quizStats: {
        totalQuizzes: Number(quizStats[0]?.count || 0),
        averageScore: Math.round(Number(quizStats[0]?.avg_score || 0)),
      },
    });
  } catch (error: any) {
    console.error("[Auth] getMe error:", error);
    res.status(500).json({ message: "Failed to retrieve user profile." });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { name, branch, semester, roll_number } = req.body;
    const db = await getDatabase();

    await db.execute(
      `UPDATE users 
       SET name = COALESCE(?, name), 
           branch = COALESCE(?, branch), 
           semester = COALESCE(?, semester), 
           roll_number = COALESCE(?, roll_number) 
       WHERE id = ?;`,
      [name, branch, semester ? parseInt(semester, 10) : null, roll_number, req.user.id]
    );

    const updatedUser = await db.getOne(
      "SELECT id, name, email, role, branch, semester, roll_number, avatar FROM users WHERE id = ?;",
      [req.user.id]
    );

    res.json({
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("[Auth] Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
}
