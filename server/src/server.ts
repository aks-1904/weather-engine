import express, { Express } from "express";
import cors from "cors";
import "dotenv/config";
import { connectMySQL } from "./config/db.js";
import { corsOptions } from "./config/corsOptions.js";
import morgan from "morgan";
import { connectRedis } from "./config/redis.js";
import { authLimiter } from "./middlewares/authLimiter.js";
import authRoutes from "./routes/auth.routes.js";
import vesselRoutes from "./routes/vessel.route.js";
import voyageRoutes from "./routes/voyage.routes.js";
import weatherRoutes from "./routes/weather.route.js";
import alertRoutes from "./routes/alert.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocketIO } from "./config/socket.js";

console.log("Server started");

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Create HTTP Server
const httpServer = createServer(app);

// Create Socket.IO server
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

// --- Global Middlewares ---
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Apis
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/vessel", vesselRoutes);
app.use("/api/voyage", voyageRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/alert", alertRoutes);

// --- Start Server ---
const startServer = async () => {
  try {
    // Connect to all databases concurrently
    await Promise.all([connectMySQL(), connectRedis()]);

    setupSocketIO(io);

    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`\nServer listening on http://localhost:${PORT}`);
      console.log("Socket.IO enabled for real-time alerts");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
