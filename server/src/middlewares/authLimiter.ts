import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 request per windowMs
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  handler: (req: Request, res: Response) => {
    console.warn(`Rate limit hit by IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many attempts. Try again after 15 minutes.",
    });
  },
  standardHeaders: true, // Send rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
