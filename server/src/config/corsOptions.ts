import { CorsOptions } from "cors";
import "dotenv/config";

const whitelist = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : [];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps) or from the whitelist
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
