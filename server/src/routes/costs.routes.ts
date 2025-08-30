import { Router } from "express";
import { checkRole, isAuthenticated } from "../middlewares/auth.middleware.js";
import { getVoyageCost } from "../controllers/costs.controller.js";

const router = Router();

// All routes in this file are protected and require an 'analyst' role.
router.use(isAuthenticated, checkRole(["analyst"]));

/**
 * @route   GET /api/costs/voyage/:voyageId
 * @desc    Calculate the total estimated cost of a voyage.
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
 * "message": "Voyage cost calculated successfully.",
 * "data": {
 * "voyageId": "voyage-uuid-123",
 * "totalDistanceNm": 3500.5,
 * "estimatedDurationDays": 12.15,
 * "estimatedFuelConsumptionTons": 750.2,
 * "costs": {
 * "fuelCost": 487905.10,
 * "canalDues": 5000,
 * "operationalCost": 24300,
 * "totalVoyageCost": 517205.10
 * }
 * }
 * }
 * @error (400 Bad Request)
 * {
 * "success": false,
 * "message": "Voyage ID is required."
 * }
 */
router.get("/voyage/:voyageId", getVoyageCost);

export default router;
