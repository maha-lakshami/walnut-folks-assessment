
import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma.js";
import accountsRouter from "./routes/accounts.js";
import transactionsRouter from "./routes/transactions.js";

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// Root endpoint
app.get("/", (_req, res) => {
  return res.status(200).json({
    message: "Walnut Folks API is running",
  });
});

// Account routes
app.use("/accounts", accountsRouter);

// Transaction routes
app.use("/transactions", transactionsRouter);

// Handle invalid JSON
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (error instanceof SyntaxError && "body" in error) {
      return res.status(400).json({
        error: "Invalid JSON request body",
      });
    }

    next(error);
  },
);

// General error handler
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled API error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  },
);

// Start server
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Walnut Folks API running at http://localhost:${PORT}`);
});
