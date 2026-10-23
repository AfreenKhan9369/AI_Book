import express from "express";
import path from "node:path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { app, ensureDatabase } from "./server/app.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    // Vite middleware in dev or static files in production
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[AI_Book] Server running at http://0.0.0.0:${PORT}`);
    });

    server.on("error", (err: any) => {
      console.error("[AI_Book] Server error:", err);
    });

    // Initialize DB and Seed Data (runs in background so server responds immediately)
    ensureDatabase().catch((err) => {
      console.error("[AI_Book] Database initialization error:", err);
    });
  } catch (err) {
    console.error("[AI_Book] Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
