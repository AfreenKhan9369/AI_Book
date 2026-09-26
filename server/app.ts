import express, { Express, Request, Response, NextFunction } from "express";
import path from "node:path";
import dotenv from "dotenv";
import { initDatabaseAndSeed } from "./utils/seedData.js";
import { uploadsDir } from "./middleware/upload.js";
import authRoutes from "./routes/authRoutes.js";
import subjectsRoutes from "./routes/subjectsRoutes.js";
import materialsRoutes from "./routes/materialsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

dotenv.config();

let isDbReady = false;
let dbInitPromise: Promise<void> | null = null;

export async function ensureDatabase(): Promise<void> {
  if (isDbReady) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        await initDatabaseAndSeed();
        isDbReady = true;
        console.log("[App] Database initialized and verified successfully.");
      } catch (err) {
        console.error("[App] Database initialization warning:", err);
      }
    })();
  }
  return dbInitPromise;
}

export function createExpressApp(): Express {
  const app = express();

  // Basic parsers
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Handle Netlify function path prefix rewriting so routes work seamlessly
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.url.startsWith("/.netlify/functions/api")) {
      req.url = req.url.replace(/^\/\.netlify\/functions\/api/, "") || "/";
    }
    next();
  });

  // Serve static uploaded PDF files
  app.use("/uploads", express.static(uploadsDir));
  app.use("/api/uploads", express.static(uploadsDir));

  // Health check endpoint
  const healthHandler = (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      name: "AI_Book API",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  };

  app.get("/api/health", healthHandler);
  app.get("/health", healthHandler);

  // REST API Routes under /api
  app.use("/api/auth", authRoutes);
  app.use("/api/subjects", subjectsRoutes);
  app.use("/api/materials", materialsRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/users", usersRoutes);

  // Also mount directly under root without /api prefix for maximum flexibility with various proxy/redirect setups
  app.use("/auth", authRoutes);
  app.use("/subjects", subjectsRoutes);
  app.use("/materials", materialsRoutes);
  app.use("/ai", aiRoutes);
  app.use("/users", usersRoutes);

  return app;
}

export const app = createExpressApp();
