import { Router } from "express";
import {
  getMaterials,
  getMaterialById,
  downloadMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  toggleBookmark,
  getOverviewStats,
} from "../controllers/materialsController.js";
import { authenticateToken, optionalAuth, requireRole } from "../middleware/auth.js";
import { uploadPdf } from "../middleware/upload.js";

const router = Router();

router.get("/stats/overview", getOverviewStats);
router.get("/", optionalAuth, getMaterials);
router.get("/:id", optionalAuth, getMaterialById);
router.get("/:id/download", downloadMaterial);
router.post("/:id/bookmark", authenticateToken, toggleBookmark);

// Faculty & Admin management routes
router.post("/", authenticateToken, requireRole(["faculty", "admin"]), uploadPdf.single("file"), createMaterial);
router.put("/:id", authenticateToken, requireRole(["faculty", "admin"]), updateMaterial);
router.delete("/:id", authenticateToken, requireRole(["faculty", "admin"]), deleteMaterial);

export default router;
