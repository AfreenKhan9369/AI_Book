import { Request, Response } from "express";
import { getDatabase } from "../config/db.js";
import { AuthRequest } from "../middleware/auth.js";

export async function getSubjects(req: Request, res: Response): Promise<void> {
  try {
    const { semester, branch } = req.query;
    const db = await getDatabase();

    let sql = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM materials m WHERE m.subject_id = s.id AND m.type = 'note') as notes_count,
        (SELECT COUNT(*) FROM materials m WHERE m.subject_id = s.id AND m.type = 'pyq') as pyqs_count
      FROM subjects s 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (semester) {
      sql += " AND s.semester = ?";
      params.push(parseInt(semester as string, 10));
    }

    if (branch && branch !== "All") {
      sql += " AND s.branch = ?";
      params.push(branch);
    }

    sql += " ORDER BY s.semester ASC, s.name ASC;";

    const subjects = await db.query(sql, params);
    res.json(subjects);
  } catch (error: any) {
    console.error("[Subjects] getSubjects error:", error);
    res.status(500).json({ message: "Failed to fetch subjects." });
  }
}

export async function createSubject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, name, branch, semester, description } = req.body;

    if (!code || !name || !branch || !semester) {
      res.status(400).json({ message: "Code, name, branch, and semester are required." });
      return;
    }

    const db = await getDatabase();
    const existing = await db.getOne("SELECT id FROM subjects WHERE code = ?;", [code.toUpperCase().trim()]);
    if (existing) {
      res.status(409).json({ message: `Subject code ${code} is already registered.` });
      return;
    }

    const result = await db.execute(
      `INSERT INTO subjects (code, name, branch, semester, description) 
       VALUES (?, ?, ?, ?, ?);`,
      [code.toUpperCase().trim(), name.trim(), branch.trim(), parseInt(semester, 10), description || ""]
    );

    const newSubject = await db.getOne("SELECT * FROM subjects WHERE id = ?;", [result.insertId]);

    res.status(201).json({
      message: "Subject created successfully!",
      subject: newSubject,
    });
  } catch (error: any) {
    console.error("[Subjects] createSubject error:", error);
    res.status(500).json({ message: "Failed to create subject." });
  }
}

export async function deleteSubject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if there are materials under this subject
    const materials = await db.query("SELECT id FROM materials WHERE subject_id = ?;", [id]);
    if (materials.length > 0) {
      res.status(400).json({
        message: `Cannot delete this subject because it currently contains ${materials.length} uploaded notes/PYQs. Please delete or reassign them first.`,
      });
      return;
    }

    await db.execute("DELETE FROM subjects WHERE id = ?;", [id]);
    res.json({ message: "Subject deleted successfully." });
  } catch (error: any) {
    console.error("[Subjects] deleteSubject error:", error);
    res.status(500).json({ message: "Failed to delete subject." });
  }
}
