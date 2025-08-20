import { Router } from "express";
import { checkRole, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createAlert,
  getAlertById,
  getAlerts,
  getAlertStats,
  getRecentAlerts,
} from "../controllers/alert.controller.js";

const router = Router();

router.use(isAuthenticated, checkRole(["captain", "analyst"]));

router.post("/", createAlert);
router.get("/", getAlerts);
router.get("/:id", getAlertById);
router.get("/stats/summary", getAlertStats);
router.get("/alerts/:voyage_id/recent", getRecentAlerts);

export default router;
