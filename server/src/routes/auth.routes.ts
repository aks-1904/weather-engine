import { login, register } from "../controllers/auth.controller.js";
import { Router } from "express";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);

export default router;
