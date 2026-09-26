import { Router } from "express";
import { getSubjects, createSubject, deleteSubject } from "../controllers/subjectsController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", getSubjects);
router.post("/", authenticateToken, requireRole(["faculty", "admin"]), createSubject);
router.delete("/:id", authenticateToken, requireRole(["faculty", "admin"]), deleteSubject);

export default router;
