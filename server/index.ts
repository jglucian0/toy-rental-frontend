import express from "express";
import cors from "cors";
import {
  initializeDatabase,
  seedDatabase,
  clearAllToys,
} from "./database/setup";
import { handleDemo } from "./routes/demo";

// Party routes
import {
  getAllParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
  getPartyStats,
} from "./routes/parties";

// Client routes
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats,
} from "./routes/clients";

// Toy routes
import {
  getAllToys,
  getToyById,
  createToy,
  updateToy,
  deleteToy,
  getToyStats,
  getToysNeedingMaintenance,
  getAvailableToys,
} from "./routes/toys";

// Transaction routes
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getOverdueTransactions,
  getTransactionCategories,
} from "./routes/transactions";

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

  // Party API routes
  app.get("/api/parties", getAllParties);
  app.get("/api/parties/stats", getPartyStats);
  app.get("/api/parties/:id", getPartyById);
  app.post("/api/parties", createParty);
  app.put("/api/parties/:id", updateParty);
  app.delete("/api/parties/:id", deleteParty);

  // Client API routes
  app.get("/api/clients", getAllClients);
  app.get("/api/clients/stats", getClientStats);
  app.get("/api/clients/:id", getClientById);
  app.post("/api/clients", createClient);
  app.put("/api/clients/:id", updateClient);
  app.delete("/api/clients/:id", deleteClient);

  // Toy API routes
  app.get("/api/toys", getAllToys);
  app.get("/api/toys/stats", getToyStats);
  app.get("/api/toys/maintenance", getToysNeedingMaintenance);
  app.get("/api/toys/available", getAvailableToys);
  app.get("/api/toys/:id", getToyById);
  app.post("/api/toys", createToy);
  app.put("/api/toys/:id", updateToy);
  app.delete("/api/toys/:id", deleteToy);

  // Transaction API routes
  app.get("/api/transactions", getAllTransactions);
  app.get("/api/transactions/stats", getTransactionStats);
  app.get("/api/transactions/overdue", getOverdueTransactions);
  app.get("/api/transactions/categories", getTransactionCategories);
  app.get("/api/transactions/:id", getTransactionById);
  app.post("/api/transactions", createTransaction);
  app.put("/api/transactions/:id", updateTransaction);
  app.delete("/api/transactions/:id", deleteTransaction);

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
