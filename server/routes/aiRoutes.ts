import { Router } from "express";
import { askQuestion, summarizeNote, generateQuiz, saveQuizResult } from "../controllers/aiController.js";
import { optionalAuth, authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/ask", optionalAuth, askQuestion);
router.post("/summarize", optionalAuth, summarizeNote);
router.post("/generate-quiz", optionalAuth, generateQuiz);
router.post("/quiz-results", authenticateToken, saveQuizResult);

export default router;
