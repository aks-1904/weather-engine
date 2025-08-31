import { Router } from "express";
import { checkRole, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getVoyageCost,
  getVoyageAnalysis,
} from "../controllers/costs.controller.js";

const router = Router();

router.use(isAuthenticated);

router.get("/:voyageId", checkRole(["analyst", "captain"]), getVoyageCost);

/**
 * @route   GET /api/costs/voyage/:voyageId/analysis
 * @desc    Get a detailed leg-by-leg analysis of a voyage for frontend visualization.
 * @access  Private (Requires 'analyst' role)
 *
 * @params
 * voyageId: The unique ID of the voyage.
 *
 * @query
 * ?fuelPrice=650.50 (Required: The current price of fuel per ton)
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Voyage analysis completed successfully.",
 * "data": {
 * "summary": { ... },
 * "legs": [
 * {
 * "leg": 1,
 * "startWaypoint": { "latitude": 1.29, "longitude": 103.85, ... },
 * "endWaypoint": { "latitude": 5.65, "longitude": 80.6, ... },
 * "distanceNm": 1575.2,
 * "vesselBearing": 95.3,
 * "weather": { "windSpeed": 15, "windDirection": 270, "waveHeight": 2.1, "waveDirection": 265 },
 * "fuelConsumptionTons": 320.5,
 * "fuelCost": 208485.25,
 * "performanceInsight": "Moderate beam wind caused minor resistance."
 * },
 * ...
 * ]
 * }
 * }
 */
router.get(
  "/:voyageId/analysis",
  checkRole(["analyst", "captain"]),
  getVoyageAnalysis
);

export default router;
