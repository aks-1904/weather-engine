import { Request, Response } from "express";
import {
  checkEmailTaken,
  checkUsernameTaken,
  createUser,
  getUserByEmailOrUsername,
} from "../services/auth.service.js";
import { RegisterCredential } from "../types/credential.js";
import { AuthResponse } from "../types/response.js";
import { comparePassword, generateJwtToken } from "../utils/auths.js";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "../utils/validators.js";
import { v4 as uuid } from "uuid";
import { mysqlPool } from "../config/db.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username }: RegisterCredential = req.body;

    // Validating data
    if (!email || !password || !username) {
      res.status(400).json({
        success: false,
        message: "Fill all details",
      });
      return;
    }

    if (!isValidUsername(username)) {
      res.status(400).json({
        success: false,
        message: "Invalid username, try another",
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
      role: "captain",
    });

    // Generate token
    const token = generateJwtToken(userId, "captain");

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token, // To save in frontend
      user: {
        // Not sending password to frontend
        id: userId,
        username,
        email,
        role: "captain",
      },
      assigned_vessel: null,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot register you account",
    });
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validatin data
    if (!emailOrUsername || !password) {
      res.status(400).json({
        success: false,
        message: "Missing fields",
      });
      return;
    }

    const user = await getUserByEmailOrUsername(emailOrUsername); // getting user if not exists user will be null

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Checking for valid password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: "Invalid credential",
      });
      return;
    }

    const token = generateJwtToken(user.id, user.role);

    const { password: _, ...userDataWithoutPassword } = user;

    if (userDataWithoutPassword.role === "captain") {
      const [assigned_vessel]: any = await mysqlPool.execute(
        "SELECT * from vessels where captain_id = ?",
        [userDataWithoutPassword.id]
      );

      res.status(200).json({
        success: true,
        message: `Welcome back ${userDataWithoutPassword.username}`,
        token,
        user: userDataWithoutPassword,
        assigned_vessel: assigned_vessel[0],
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Welcome back ${userDataWithoutPassword.username}`,
      token,
      user: userDataWithoutPassword,
    } satisfies AuthResponse);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};
