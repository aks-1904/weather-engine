import { Request, Response } from "express";
import {
  checkEmailTaken,
  checkUsernameTaken,
  createUser,
} from "../services/auth.service.js";
import { RegisterCredential } from "../types/credential.js";
import { AuthResponse } from "../types/response.js";
import { generateJwtToken } from "../utils/auths.js";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "../utils/validators.js";
import { v4 as uuid } from "uuid";

export const register = async (
  req: Request,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    const { email, password, username, role }: RegisterCredential = req.body;

    // Validating data
    if (!email || !password || !username || !role) {
      res.status(400).json({
        success: false,
        message: "Fill all details",
      });
      return;
    }

    if (!["captain", "analyst"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role",
      });
      return;
    }

    if (!isValidUsername(username)) {
      res.status(400).json({
        success: false,
        message: "Invalid username",
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({
        success: false,
        message:
          "Password should be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character",
      });
      return;
    }

    // Checking if email or username taken
    const isEmailTaken = await checkEmailTaken(email);
    if (isEmailTaken) {
      res.status(401).json({
        success: false,
        message: "Email already taken",
      });
      return;
    }

    const isUsernameTaken = await checkUsernameTaken(username);
    if (isUsernameTaken) {
      res.status(401).json({
        success: false,
        message: "Username already taken",
      });
      return;
    }

    // Generating random id for user
    const userId = uuid();

    await createUser({
      // Creating user to database
      id: userId,
      username,
      email,
      password,
      role,
    });

    // Generate token
    const token = generateJwtToken(userId, role);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token, // To save in frontend
      user: {
        // Not sending password to frontend
        id: userId,
        username,
        email,
        role,
      },
    } satisfies AuthResponse);
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot register you account",
    });
    return;
  }
};
