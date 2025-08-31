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

// This middleware ensures that a user must be logged in to access any of the alert routes.
router.use(isAuthenticated);

/**
 * @route   POST /api/alerts/
 * @desc    Create a new alert
 * @access  Private (Requires 'analyst' role)
 *
 * @body
 * {
 * "voyage_id": "voyage-123",
 * "alert_type": "Weather Warning",
 * "message": "High winds expected in the North Atlantic.",
 * "severity": "High",
 * "category": "Weather",
 * "priority": 8,
 * "recommendations": ["Reduce speed", "Secure loose items"],
 * "weather_data": { "wind_speed": "45 knots", "wave_height": "6 meters" }
 * }
 *
 * @success (201 Created)
 * {
 * "success": true,
 * "message": "Alert created successfully",
 * "data": {
 * "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
 * "voyage_id": "voyage-123",
 * "alert_type": "Weather Warning",
 * "message": "High winds expected in the North Atlantic.",
 * "severity": "High",
 * "category": "Weather",
 * "priority": 8,
 * "recommendations": "[\"Reduce speed\",\"Secure loose items\"]",
 * "weather_data": "{\"wind_speed\":\"45 knots\",\"wave_height\":\"6 meters\"}",
 * "created_at": "2025-08-21T01:52:14.000Z"
 * }
 * }
 */
router.post("/", checkRole(["analyst"]), createAlert);

// This middleware applies to all subsequent routes in this file.
// It ensures the user role is either 'captain' or 'analyst'.
// router.use(checkRole(["captain", "analyst"]));

/**
 * @route   GET /api/alerts/
 * @desc    Get a paginated list of alerts with optional filters
 * @access  Private (Requires 'captain' or 'analyst' role)
 *
 * @query
 * ?voyage_id=voyage-123
 * &severity=High
 * &page=1
 * &limit=15
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Alerts fetched successfully",
 * "data": [
 * {
 * "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
 * "voyage_id": "voyage-123",
 * "severity": "High",
 * ...
 * }
 * ]
 * }
 */
router.get("/", getAlerts);

/**
 * @route   GET /api/alerts/:id
 * @desc    Get a single alert by its unique ID
 * @access  Private (Requires 'captain' or 'analyst' role)
 *
 * @params
 * id: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Alert fetched successfully",
 * "data": {
 * "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
 * ...
 * }
 * }
 */
router.get("/:id", getAlertById);

/**
 * @route   GET /api/alerts/stats/summary
 * @desc    Get a count of alerts grouped by severity
 * @access  Private (Requires 'captain' or 'analyst' role)
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Alert stats fetched",
 * "data": [
 * { "severity": "High", "count": 12 },
 * { "severity": "Medium", "count": 35 },
 * { "severity": "Low", "count": 50 }
 * ]
 * }
 */
router.get("/stats/summary", getAlertStats);

/**
 * @route   GET /api/alerts/:voyage_id/recent
 * @desc    Get recent alerts (last 10 days) for a specific voyage
 * @access  Private (Requires 'captain' or 'analyst' role)
 *
 * @params
 * voyage_id: "voyage-xyz-789"
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "count": 5,
 * "message": "Recent alerts from last 10 days fetched successfully",
 * "data": [
 * { "id": "uuid-for-alert-1", ... },
 * { "id": "uuid-for-alert-2", ... }
 * ]
 * }
 */
router.get("/:voyage_id/recent", getRecentAlerts);

export default router;
