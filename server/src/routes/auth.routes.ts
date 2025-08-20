import { login, register } from "../controllers/auth.controller.js";
import { Router } from "express";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 *
 * @body
 * {
 * "username": "testuser",
 * "email": "test@example.com",
 * "password": "strongPassword123",
 * "role": "captain" // or "analyst"
 * }
 * 
 * @success (201 Created)
 * {
 * "success": true,
 * "message": "Account created successfully",
 * "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 * "user": {
 * "id": "c123-b456-a789",
 * "username": "testuser",
 * "email": "test@example.com",
 * "role": "captain"
 * }
 */
router.route("/register").post(register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 *
 * @body
 * {
 * "emailOrUsername": "testuser",
 * "password": "strongPassword123"
 * }
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Welcome back testuser",
 * "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 * "user": {
 * "id": "c123-b456-a789",
 * "username": "testuser",
 * "email": "test@example.com",
 * "role": "captain"
 * }
 */
router.route("/login").post(login);

export default router;
