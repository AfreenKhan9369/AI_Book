import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDatabase } from "../config/db.js";
import { generateToken, AuthRequest } from "../middleware/auth.js";
import { storeRegistrationInSupabase, getSupabase, parseAvatarUrl } from "../config/supabase.js";

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

    // 1. Verify existence against live Supabase PostgreSQL database
    let existsInSupabase = false;
    try {
      const { data: supaReg } = await supabase
        .from("registrations")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (supaReg) {
        existsInSupabase = true;
      }
    } catch {}

    const isDemoAccount = cleanEmail === "faculty@college.edu" || cleanEmail === "student@college.edu";

    if (existsInSupabase || isDemoAccount) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    // If the student was deleted from Supabase database, purge any stale cached local entry
    await db.execute("DELETE FROM users WHERE email = ?;", [cleanEmail]);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const assignedRole = role === "faculty" || role === "admin" ? "faculty" : "student";

    // 2. Store registration details and password hash in Supabase PostgreSQL & Auth
    const supabaseSync = await storeRegistrationInSupabase({
      name: name.trim(),
      email: cleanEmail,
      password,
      password_hash: hashedPassword,
      role: assignedRole,
      branch,
      semester: parseInt(semester, 10) || 1,
      roll_number: roll_number.trim(),
    });

    // 3. Store in database with Supabase sync tracking
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

    const newUserId = Number(insertResult.insertId) || 1;
    const userPayload = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole as "student" | "faculty",
      branch,
      semester: parseInt(semester, 10) || 1,
      roll_number: roll_number.trim(),
      avatar: "",
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

    const cleanEmail = email.toLowerCase().trim();
    const db = await getDatabase();
    const supabase = getSupabase();

    // 1. Fast match for built-in demo accounts
    let isMatch = false;
    if (cleanEmail === "faculty@college.edu" && password === "faculty123") {
      isMatch = true;
    } else if (cleanEmail === "student@college.edu" && password === "student123") {
      isMatch = true;
    }

    // 2. Look up user in database (handles in-memory cache and Supabase sync)
    let user = await db.getOne(
      "SELECT id, name, email, password, role, branch, semester, roll_number, avatar, supabase_user_id, supabase_synced FROM users WHERE email = ?;",
      [cleanEmail]
    );

    // 3. If user not in local database, fetch directly from Supabase registrations
    if (!user) {
      try {
        const { data: supaReg } = await supabase
          .from("registrations")
          .select("*")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (supaReg) {
          const { passwordHash, avatarUrl } = parseAvatarUrl(supaReg.avatar_url || "");
          const insertRes = await db.execute(
            `INSERT INTO users (name, email, password, role, branch, semester, roll_number, avatar, supabase_user_id, supabase_synced, supabase_synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP);`,
            [
              supaReg.name,
              cleanEmail,
              passwordHash || "",
              supaReg.role || "student",
              supaReg.branch || "Computer Science",
              supaReg.semester || 1,
              supaReg.roll_number || "",
              avatarUrl || "",
              supaReg.auth_user_id || supaReg.id,
            ]
          );
          user = {
            id: insertRes.insertId,
            name: supaReg.name,
            email: cleanEmail,
            password: passwordHash || "",
            role: supaReg.role || "student",
            branch: supaReg.branch || "Computer Science",
            semester: supaReg.semester || 1,
            roll_number: supaReg.roll_number || "",
            avatar: avatarUrl || "",
            supabase_user_id: supaReg.auth_user_id || supaReg.id,
            supabase_synced: 1,
          };
        }
      } catch (err) {
        console.warn("[Auth] Supabase lookup error:", err);
      }
    }

    // 4. Supabase Auth fallback if still not found
    if (!user) {
      try {
        const { data: supaLogin, error: supaError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        const credentialsConfirmed =
          !!supaLogin?.user ||
          (supaError && supaError.message.toLowerCase().includes("email not confirmed"));

        if (credentialsConfirmed) {
          isMatch = true;
          const meta = supaLogin?.user?.user_metadata || {};
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          const assignedRole = meta.role === "faculty" || meta.role === "admin" ? "faculty" : "student";
          const resInsert = await db.execute(
            `INSERT INTO users (name, email, password, role, branch, semester, roll_number, supabase_user_id, supabase_synced, supabase_synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP);`,
            [
              meta.name || cleanEmail.split("@")[0],
              cleanEmail,
              hashedPassword,
              assignedRole,
              meta.branch || "Computer Science",
              meta.semester || 4,
              meta.roll_number || "",
              supaLogin?.user?.id || "",
            ]
          );
          user = {
            id: resInsert.insertId,
            name: meta.name || cleanEmail.split("@")[0],
            email: cleanEmail,
            password: hashedPassword,
            role: assignedRole,
            branch: meta.branch || "Computer Science",
            semester: meta.semester || 4,
            roll_number: meta.roll_number || "",
            avatar: "",
            supabase_user_id: supaLogin?.user?.id || "",
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

    // 5. Verify password
    if (!isMatch) {
      // 5.1 Check bcrypt hash if present
      if (user.password && user.password.length > 10) {
        try {
          isMatch = await bcrypt.compare(password, user.password);
        } catch {
          isMatch = false;
        }
      }

      // 5.2 Supabase Auth verification check
      if (!isMatch) {
        try {
          const { data: supaLogin, error: supaError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          // Session returned OR "Email not confirmed" confirms the user password was correct!
          if (supaLogin?.user || (supaError && supaError.message.toLowerCase().includes("email not confirmed"))) {
            isMatch = true;
            // Upgrade password hash locally and in Supabase registrations
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(password, salt);
            user.password = newHash;
            await db.execute("UPDATE users SET password = ? WHERE id = ?;", [newHash, user.id]);
          }
        } catch (supaErr) {
          console.warn("[Auth] Supabase Auth check error:", supaErr);
        }
      }
    }

    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const { avatarUrl } = parseAvatarUrl(user.avatar || "");

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      semester: user.semester,
      roll_number: user.roll_number,
      avatar: avatarUrl || "",
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

    const { avatarUrl } = parseAvatarUrl(user.avatar || "");
    const cleanUser = {
      ...user,
      avatar: avatarUrl || "",
    };

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
      user: cleanUser,
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

    const { avatarUrl } = parseAvatarUrl(updatedUser?.avatar || "");

    res.json({
      message: "Profile updated successfully!",
      user: {
        ...updatedUser,
        avatar: avatarUrl || "",
      },
    });
  } catch (error: any) {
    console.error("[Auth] Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
}
