import {
  getHealthCheck,
  getMarineWeather,
  getOptimalSpeed,
  getRealTimeWeather,
  getWeatherForecast,
} from "../controllers/weather.controller.js";
import { Router } from "express";
import { checkRole, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(isAuthenticated, checkRole(["captain", "analyst"]));

router.get("/realtime", getRealTimeWeather);
router.get("/forecast", getWeatherForecast);
router.get("/optimal-speed", getOptimalSpeed);
router.get("/marine", getMarineWeather);

// Health check endpoint (public)
router.get("/health", getHealthCheck);

export default router;
