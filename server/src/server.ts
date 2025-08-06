import express, { Express, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { connectMySQL } from "./config/db.js";
import { corsOptions } from "./config/corsOptions.js";
import morgan from "morgan";
import { connectRedis } from "./config/redis.js";

const app: Express = express();
const PORT = process.env.PORT || 3000;

// --- Global Middlewares ---
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- Start Server ---
const startServer = async () => {
  try {
    // Connect to all databases concurrently
    await Promise.all([connectMySQL(), connectRedis()]);

    app.listen(PORT, () => {
      console.log(`\nServer listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
