import express from "express";
import cors from "cors";
import {
  initializeDatabase,
  seedDatabase,
  clearAllToys,
} from "./database/setup";
import { handleDemo } from "./routes/demo";


export function createServer() {
  const app = express();

  // Initialize database
  try {
    initializeDatabase();
    seedDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "Hello from Express server v2!",
      timestamp: new Date().toISOString(),
      status: "healthy",
    });
  });

  app.get("/api/demo", handleDemo);

  // Global error handler
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Global error handler:", err);
      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "An internal server error occurred",
      });
    },
  );

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      error: "NOT_FOUND",
      message: "API endpoint not found",
    });
  });

  return app;
}
