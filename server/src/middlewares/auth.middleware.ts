import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { BaseResponse } from "../types/response.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Middleware to check authenticated user
export const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response<BaseResponse>,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Checking if authorization header is given or not
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Missing or invalid token",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    // Getting token data
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    // Checking for valid token
    if (!decoded) {
      res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    // Setting up user data to access anywhere
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Valid role middleware
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions",
      });
      return;
    }
    next();
  };
};
