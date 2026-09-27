import express, { Express, Request, Response, NextFunction } from "express";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import { initDatabaseAndSeed } from "./utils/seedData.js";
import { uploadsDir } from "./middleware/upload.js";
import { generateFallbackPdf, writePdfToDisk } from "./utils/pdfGenerator.js";
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

  // Set framing and CORS headers so PDF iframes never fail with "refused to connect"
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.removeHeader("X-Frame-Options");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' *");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

  // Handle Netlify function path prefix rewriting so routes work seamlessly
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.url.startsWith("/.netlify/functions/api")) {
      req.url = req.url.replace(/^\/\.netlify\/functions\/api/, "") || "/";
    }
    next();
  });

  // Serve static uploaded PDF files from both public/uploads and root uploads
  const publicUploads = path.join(process.cwd(), "public", "uploads");
  try {
    if (!fs.existsSync(publicUploads)) fs.mkdirSync(publicUploads, { recursive: true });
  } catch {}

  app.use("/uploads", express.static(publicUploads));
  app.use("/uploads", express.static(uploadsDir));
  app.use("/api/uploads", express.static(publicUploads));
  app.use("/api/uploads", express.static(uploadsDir));

  // Dynamic fallback handler for any requested PDF document to guarantee no 404
  const handlePdfDocument = (req: Request, res: Response, next: NextFunction) => {
    const rawFileName = req.params.fileName || path.basename(req.path);
    if (!rawFileName || !rawFileName.toLowerCase().endsWith(".pdf")) {
      return next();
    }
    const cleanName = path.basename(rawFileName);

    const candidates = [
      path.join(publicUploads, cleanName),
      path.join(uploadsDir, cleanName),
      path.join("/tmp", "uploads", cleanName),
    ];

    for (const loc of candidates) {
      if (fs.existsSync(loc)) {
        res.setHeader("Content-Type", "application/pdf");
        return fs.createReadStream(loc).pipe(res);
      }
    }

    try {
      const pdfBuffer = generateFallbackPdf(cleanName);
      writePdfToDisk(cleanName, pdfBuffer);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      return res.end(pdfBuffer);
    } catch (err) {
      console.error("[App] Fallback PDF generation error:", err);
      next();
    }
  };

  app.get("/uploads/:fileName", handlePdfDocument);
  app.get("/api/uploads/:fileName", handlePdfDocument);

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
