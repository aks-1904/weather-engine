import { Router } from "express";
import { checkRole, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  acknowledgeAlert,
  createAlert,
  getAlertById,
  getAlerts,
  getAlertStats,
  resolveAlert,
} from "../controllers/alert.controller.js";

const router = Router();

router.use(isAuthenticated, checkRole(["captain", "analyst"]));

router.post("/", createAlert);
router.get("/", getAlerts);
router.get("/:id", getAlertById);
router.patch("/:id/acknowledge", acknowledgeAlert);
router.patch("/:id/resolve", resolveAlert);
router.get("/stats/summary", getAlertStats);

export default router;
