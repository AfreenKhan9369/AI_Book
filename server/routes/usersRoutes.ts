import { Router } from "express";
import {
  getStudents,
  deleteUser,
  getSupabaseStatus,
  getSupabaseRegistrations,
  syncAllToSupabase,
} from "../controllers/usersController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

// Supabase status and management routes
router.get("/supabase/status", authenticateToken, getSupabaseStatus);
router.get("/supabase/registrations", authenticateToken, requireRole(["faculty", "admin"]), getSupabaseRegistrations);
router.post("/supabase/sync-all", authenticateToken, requireRole(["faculty", "admin"]), syncAllToSupabase);

// Student directory and user management
router.get("/students", authenticateToken, requireRole(["faculty", "admin"]), getStudents);
router.delete("/:id", authenticateToken, requireRole(["faculty", "admin"]), deleteUser);

export default router;
