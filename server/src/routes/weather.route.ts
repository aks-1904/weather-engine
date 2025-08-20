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

// Note: The health check endpoint is currently placed after the authentication middleware,
// making it a protected route. If it should be public, move it before this line.
router.use(isAuthenticated, checkRole(["captain", "analyst"]));

/**
 * @route   GET /api/weather/realtime
 * @desc    Get real-time weather for specific coordinates
 * @access  Private (Requires 'captain' or 'analyst' role)
 *
 * @query
 * ?lat=40.7128
 * &lon=-74.0060
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "data": {
 * "temperature_celsius": 22,
 * "wind_speed_mps": 5.5,
 * "wind_direction_deg": 180,
 * "precipitation_mm": 0,
 * "description": "Partly cloudy"
 * },
 * "metadata": {
 * "source": "Open-Meteo",
 * "timestamp": 1724204400000,
 * "processingTimeMs": 150
 * }
 * }
 */
router.get("/realtime", getRealTimeWeather);

/**
 * @route   GET /api/weather/forecast
 * @desc    Get a weather forecast for up to 16 days
 * @access  Private (Requires 'captain' or 'analyst' role)
 *
 * @query
 * ?lat=40.7128
 * &lon=-74.0060
 * &days=7 (Optional, default: 10, max: 16)
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "data": [
 * {
 * "date": "2025-08-21",
 * "max_temp_celsius": 25,
 * "min_temp_celsius": 18,
 * "precipitation_sum_mm": 2.5,
 * "description": "Light rain showers"
 * },
 * ...
 * ],
 * "metadata": { ... }
 * }
 */
router.get("/forecast", getWeatherForecast);

/**
 * @route   GET /api/weather/optimal-speed
 * @desc    Get an optimal speed recommendation based on weather
 * @access  Private (Requires 'captain' or 'analyst' role)
 *
 * @query
 * ?lat=34.0522
 * &lon=-118.2437
 * &marine=true (Optional, defaults to false. Use true for marine-specific data)
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "data": {
 * "weather": {
 * "wave_height_m": 2.5,
 * "wind_speed_mps": 12.0,
 * ...
 * },
 * "speedRecommendation": {
 * "optimal_knots": 15,
 * "reason": "Moderate wave height. Reducing speed is advised for stability."
 * }
 * },
 * "metadata": { ... }
 * }
 */
router.get("/optimal-speed", getOptimalSpeed);

/**
 * @route   GET /api/weather/marine
 * @desc    Get marine-specific weather data (waves, swell, etc.)
 * @access  Private (Requires 'captain' or 'analyst' role)
 *
 * @query
 * ?lat=5.6037
 * &lon=-0.1870
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "data": {
 * "wave_height_m": 1.8,
 * "wave_direction_deg": 220,
 * "swell_period_s": 9.5,
 * "sea_surface_temp_celsius": 28
 * },
 * "metadata": { ... }
 * }
 */
router.get("/marine", getMarineWeather);

/**
 * @route   GET /api/weather/health
 * @desc    Check the health of the weather service API and cache
 * @access  Private (Requires 'captain' or 'analyst' role as currently configured)
 *
 * @success (200 OK - Healthy)
 * {
 * "success": true,
 * "data": {
 * "api": "healthy",
 * "cache": "healthy",
 * "uptime": 3600.5
 * },
 * "metadata": { ... }
 * }
 *
 * @success (503 Service Unavailable - Unhealthy)
 * {
 * "success": false,
 * "data": {
 * "api": "unhealthy",
 * "cache": "healthy",
 * "uptime": 3610.2
 * },
 * "metadata": { ... }
 * }
 */
router.get("/health", getHealthCheck);

export default router;
