import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { getDatabase } from "../config/db.js";
import { AuthRequest } from "../middleware/auth.js";
import { generateFallbackPdf, writePdfToDisk } from "../utils/pdfGenerator.js";

// Helper to format bytes to human readable string
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export async function getMaterials(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { type, semester, subject_id, branch, search, bookmarkedOnly, sort = "latest" } = req.query;
    const db = await getDatabase();
    const currentUserId = req.user?.id;

    let sql = `
      SELECT m.*, 
             s.name as subject_name, 
             s.code as subject_code,
             ${currentUserId ? `(SELECT 1 FROM bookmarks b WHERE b.material_id = m.id AND b.user_id = ${currentUserId}) as is_bookmarked` : "0 as is_bookmarked"}
      FROM materials m
      JOIN subjects s ON m.subject_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (type && type !== "all") {
      sql += " AND m.type = ?";
      params.push(type);
    }

    if (semester && semester !== "all") {
      sql += " AND m.semester = ?";
      params.push(parseInt(semester as string, 10));
    }

    if (subject_id && subject_id !== "all") {
      sql += " AND m.subject_id = ?";
      params.push(parseInt(subject_id as string, 10));
    }

    if (branch && branch !== "all" && branch !== "All") {
      sql += " AND m.branch = ?";
      params.push(branch);
    }

    if (bookmarkedOnly === "true" && currentUserId) {
      sql += " AND EXISTS (SELECT 1 FROM bookmarks b WHERE b.material_id = m.id AND b.user_id = ?)";
      params.push(currentUserId);
    }

    if (search) {
      const term = `%${(search as string).trim()}%`;
      sql += " AND (m.title LIKE ? OR m.description LIKE ? OR s.name LIKE ? OR s.code LIKE ? OR m.module_unit LIKE ?)";
      params.push(term, term, term, term, term);
    }

    if (sort === "popular" || sort === "downloads") {
      sql += " ORDER BY m.downloads_count DESC, m.created_at DESC";
    } else if (sort === "views") {
      sql += " ORDER BY m.views_count DESC, m.created_at DESC";
    } else {
      sql += " ORDER BY m.created_at DESC";
    }

    const materials = await db.query(sql, params);
    res.json(materials);
  } catch (error: any) {
    console.error("[Materials] getMaterials error:", error);
    res.status(500).json({ message: "Failed to fetch materials." });
  }
}

export async function getMaterialById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const currentUserId = req.user?.id;

    // Increment views count
    await db.execute("UPDATE materials SET views_count = views_count + 1 WHERE id = ?;", [id]);

    const sql = `
      SELECT m.*, 
             s.name as subject_name, 
             s.code as subject_code,
             ${currentUserId ? `(SELECT 1 FROM bookmarks b WHERE b.material_id = m.id AND b.user_id = ${currentUserId}) as is_bookmarked` : "0 as is_bookmarked"}
      FROM materials m
      JOIN subjects s ON m.subject_id = s.id
      WHERE m.id = ?;
    `;

    const material = await db.getOne(sql, [id]);

    if (!material) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    res.json(material);
  } catch (error: any) {
    console.error("[Materials] getMaterialById error:", error);
    res.status(500).json({ message: "Failed to retrieve material." });
  }
}

export async function downloadMaterial(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const material = await db.getOne("SELECT * FROM materials WHERE id = ?;", [id]);
    if (!material) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    // Increment downloads count
    await db.execute("UPDATE materials SET downloads_count = downloads_count + 1 WHERE id = ?;", [id]);

    const candidates = [
      path.join(process.cwd(), "public", material.file_path.replace(/^\//, "")),
      path.join(process.cwd(), material.file_path.replace(/^\//, "")),
      path.join("/tmp", material.file_path.replace(/^\//, "")),
      path.join(process.cwd(), "public", "uploads", material.file_name),
      path.join(process.cwd(), "uploads", material.file_name),
      path.join("/tmp", "uploads", material.file_name),
    ];

    let filePath = candidates.find((p) => fs.existsSync(p));

    if (!filePath) {
      try {
        const fallbackBuf = generateFallbackPdf(material.file_name);
        writePdfToDisk(material.file_name, fallbackBuf);
        filePath = path.join(process.cwd(), "public", "uploads", material.file_name);
      } catch (err) {
        console.error("[Materials] Fallback PDF generation failed:", err);
      }
    }

    if (filePath && fs.existsSync(filePath)) {
      res.setHeader("Content-Disposition", `attachment; filename="${material.file_name}"`);
      res.setHeader("Content-Type", "application/pdf");
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ message: "The requested PDF file is not present on the server." });
    }
  } catch (error: any) {
    console.error("[Materials] download error:", error);
    res.status(500).json({ message: "Failed to download material." });
  }
}

export async function createMaterial(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const {
      title,
      type = "note",
      subject_id,
      semester,
      branch,
      academic_year = "2024-25",
      module_unit = "Unit 1",
      description = "",
    } = req.body;

    if (!title || !subject_id) {
      res.status(400).json({ message: "Title and subject are required." });
      return;
    }

    const db = await getDatabase();
    const subject = await db.getOne("SELECT * FROM subjects WHERE id = ?;", [subject_id]);
    if (!subject) {
      res.status(400).json({ message: "Selected subject was not found." });
      return;
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let fileName = "";
    let filePath = "";
    let fileSize = "1.2 MB";

    if (req.file) {
      fileName = req.file.originalname;
      filePath = `/uploads/${req.file.filename}`;
      fileSize = formatBytes(req.file.size);
    } else {
      // Auto-generate a valid PDF document if uploaded without direct binary file
      const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, "_");
      const genFileName = `${Date.now()}-${safeTitle}.pdf`;
      const physicalPath = path.join(uploadsDir, genFileName);

      const samplePdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R
   /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
>>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 16 Tf
50 720 Td
(${title.replace(/[()\\]/g, "")}) Tj
/F1 12 Tf
0 -30 Td
(Subject: ${subject.name} | Unit: ${module_unit}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000300 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
470
%%EOF`;

      fs.writeFileSync(physicalPath, samplePdfContent, "utf-8");
      fileName = `${safeTitle}.pdf`;
      filePath = `/uploads/${genFileName}`;
      fileSize = "1.1 MB";
    }

    const insertResult = await db.execute(
      `INSERT INTO materials (
        title, type, subject_id, semester, branch, academic_year, module_unit,
        file_name, file_path, file_size, file_type, description, uploader_id, uploader_name,
        downloads_count, views_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0);`,
      [
        title.trim(),
        type,
        subject.id,
        semester ? parseInt(semester, 10) : subject.semester,
        branch || subject.branch,
        academic_year,
        module_unit,
        fileName,
        filePath,
        fileSize,
        "application/pdf",
        description,
        req.user.id,
        req.user.name,
      ]
    );

    const created = await db.getOne(
      `SELECT m.*, s.name as subject_name, s.code as subject_code 
       FROM materials m JOIN subjects s ON m.subject_id = s.id 
       WHERE m.id = ?;`,
      [insertResult.insertId]
    );

    res.status(201).json({
      message: `${type === "pyq" ? "PYQ" : "Note"} published successfully!`,
      material: created,
    });
  } catch (error: any) {
    console.error("[Materials] create error:", error);
    res.status(500).json({ message: "Failed to upload material." });
  }
}

export async function updateMaterial(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, subject_id, semester, branch, academic_year, module_unit, description } = req.body;
    const db = await getDatabase();

    const existing = await db.getOne("SELECT * FROM materials WHERE id = ?;", [id]);
    if (!existing) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    await db.execute(
      `UPDATE materials 
       SET title = COALESCE(?, title),
           subject_id = COALESCE(?, subject_id),
           semester = COALESCE(?, semester),
           branch = COALESCE(?, branch),
           academic_year = COALESCE(?, academic_year),
           module_unit = COALESCE(?, module_unit),
           description = COALESCE(?, description)
       WHERE id = ?;`,
      [
        title,
        subject_id ? parseInt(subject_id, 10) : null,
        semester ? parseInt(semester, 10) : null,
        branch,
        academic_year,
        module_unit,
        description,
        id,
      ]
    );

    const updated = await db.getOne(
      `SELECT m.*, s.name as subject_name, s.code as subject_code 
       FROM materials m JOIN subjects s ON m.subject_id = s.id 
       WHERE m.id = ?;`,
      [id]
    );

    res.json({ message: "Material updated successfully!", material: updated });
  } catch (error: any) {
    console.error("[Materials] update error:", error);
    res.status(500).json({ message: "Failed to update material." });
  }
}

export async function deleteMaterial(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const material = await db.getOne("SELECT * FROM materials WHERE id = ?;", [id]);
    if (!material) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    // Try deleting physical file if it exists
    if (material.file_path) {
      const physicalPath = path.join(process.cwd(), material.file_path.replace(/^\//, ""));
      if (fs.existsSync(physicalPath)) {
        try {
          fs.unlinkSync(physicalPath);
        } catch (e) {
          // ignore unlink error
        }
      }
    }

    // Remove bookmarks associated with this material
    await db.execute("DELETE FROM bookmarks WHERE material_id = ?;", [id]);
    // Remove material record
    await db.execute("DELETE FROM materials WHERE id = ?;", [id]);

    res.json({ message: "Material deleted successfully." });
  } catch (error: any) {
    console.error("[Materials] delete error:", error);
    res.status(500).json({ message: "Failed to delete material." });
  }
}

export async function toggleBookmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in to save bookmarks." });
      return;
    }

    const { id } = req.params;
    const db = await getDatabase();

    const existingBookmark = await db.getOne(
      "SELECT id FROM bookmarks WHERE user_id = ? AND material_id = ?;",
      [req.user.id, id]
    );

    let isBookmarked = false;
    if (existingBookmark) {
      await db.execute("DELETE FROM bookmarks WHERE id = ?;", [existingBookmark.id]);
      isBookmarked = false;
    } else {
      await db.execute(
        "INSERT INTO bookmarks (user_id, material_id) VALUES (?, ?);",
        [req.user.id, id]
      );
      isBookmarked = true;
    }

    res.json({
      bookmarked: isBookmarked,
      message: isBookmarked ? "Added to your saved notes." : "Removed from your saved notes.",
    });
  } catch (error: any) {
    console.error("[Materials] toggleBookmark error:", error);
    res.status(500).json({ message: "Failed to update bookmark." });
  }
}

export async function getOverviewStats(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDatabase();

    const [notesCountRow] = await db.query("SELECT COUNT(*) as count FROM materials WHERE type = 'note';");
    const [pyqsCountRow] = await db.query("SELECT COUNT(*) as count FROM materials WHERE type = 'pyq';");
    const [subjectsCountRow] = await db.query("SELECT COUNT(*) as count FROM subjects;");
    const [studentsCountRow] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'student';");
    const [facultyCountRow] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'faculty';");
    const [downloadsRow] = await db.query("SELECT SUM(downloads_count) as total_downloads FROM materials;");

    const popularMaterials = await db.query(`
      SELECT m.id, m.title, m.type, m.downloads_count, m.views_count, s.name as subject_name
      FROM materials m
      JOIN subjects s ON m.subject_id = s.id
      ORDER BY m.downloads_count DESC
      LIMIT 5;
    `);

    res.json({
      totalNotes: Number(notesCountRow?.count || 0),
      totalPyqs: Number(pyqsCountRow?.count || 0),
      totalSubjects: Number(subjectsCountRow?.count || 0),
      totalStudents: Number(studentsCountRow?.count || 0),
      totalFaculty: Number(facultyCountRow?.count || 0),
      totalDownloads: Number(downloadsRow?.total_downloads || 0),
      popularMaterials,
    });
  } catch (error: any) {
    console.error("[Stats] getOverviewStats error:", error);
    res.status(500).json({ message: "Failed to fetch platform statistics." });
  }
}
