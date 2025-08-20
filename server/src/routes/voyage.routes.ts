import {
  createVoyage,
  deleteVoyage,
  getAllVoyages,
  getVoyageById,
  getVoyagesByVessel,
  updateVoyage,
} from "../controllers/voyage.controller.js";
import { Router } from "express";
import { checkRole, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// All voyage routes are protected and require an 'analyst' role.
router.use(isAuthenticated, checkRole(["analyst"]));

/**
 * @route   POST /api/voyages/
 * @desc    Create a new voyage plan with a route
 * @access  Private (Requires 'analyst' role)
 *
 * @body
 * {
 * "vessel_id": "vessel-uuid-456",
 * "origin_port": "Port of Singapore",
 * "destination_port": "Port of Rotterdam",
 * "etd": "2025-09-01T12:00:00Z",
 * "eta": "2025-09-30T18:00:00Z",
 * "status": "planned",
 * "route_waypoints": [
 * { "lat": 1.290270, "lng": 103.851959 },
 * { "lat": 51.924420, "lng": 4.477733 }
 * ]
 * }
 *
 * @success (201 Created)
 * {
 * "success": true,
 * "message": "Voyage created successfully",
 * "voyage": {
 * "id": "voyage-uuid-123",
 * "vessel_id": "vessel-uuid-456",
 * "origin_port": "Port of Singapore",
 * "destination_port": "Port of Rotterdam",
 * "etd": "2025-09-01T12:00:00.000Z",
 * "eta": "2025-09-30T18:00:00.000Z",
 * "status": "planned",
 * "route_waypoints": "[{\"lat\":1.29027,\"lng\":103.851959},{\"lat\":51.92442,\"lng\":4.477733}]"
 * }
 * }
 */
router.post("/", createVoyage);

/**
 * @route   GET /api/voyages/
 * @desc    Get all voyages with optional filtering
 * @access  Private (Requires 'analyst' role)
 *
 * @query
 * ?status=in-progress
 * &vessel_id=vessel-uuid-456
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Voyages retrieved successfully",
 * "voyages": [
 * {
 * "id": "voyage-uuid-123",
 * "vessel_id": "vessel-uuid-456",
 * "status": "in-progress",
 * ...
 * }
 * ]
 * }
 */
router.get("/", getAllVoyages);

/**
 * @route   GET /api/voyages/:id
 * @desc    Get a single voyage by its ID
 * @access  Private (Requires 'analyst' role)
 *
 * @params
 * id: "voyage-uuid-123"
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Voyage retrieved successfully",
 * "voyage": {
 * "id": "voyage-uuid-123",
 * ...
 * }
 * }
 */
router.get("/:id", getVoyageById);

/**
 * @route   PATCH /api/voyages/:id
 * @desc    Update voyage details (e.g., status, ETA)
 * @access  Private (Requires 'analyst' role)
 *
 * @params
 * id: "voyage-uuid-123"
 *
 * @body (Provide only the fields to update)
 * {
 * "status": "completed",
 * "eta": "2025-09-29T20:00:00Z"
 * }
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Voyage updated successfully",
 * "voyage": {
 * "id": "voyage-uuid-123",
 * "status": "completed",
 * "eta": "2025-09-29T20:00:00.000Z",
 * ...
 * }
 * }
 */
router.patch("/:id", updateVoyage);

/**
 * @route   DELETE /api/voyages/:id
 * @desc    Delete a voyage plan
 * @access  Private (Requires 'analyst' role)
 *
 * @params
 * id: "voyage-uuid-123"
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Voyage deleted successfully"
 * }
 */
router.delete("/:id", deleteVoyage);

/**
 * @route   GET /api/voyages/vessel/:vesselId
 * @desc    Get all voyages for a specific vessel
 * @access  Private (Requires 'analyst' role)
 *
 * @params
 * vesselId: "vessel-uuid-456"
 *
 * @query (Optional)
 * ?status=planned
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Voyages retrieved successfully",
 * "voyages": [
 * {
 * "id": "voyage-uuid-123",
 * "vessel_id": "vessel-uuid-456",
 * "status": "planned",
 * ...
 * }
 * ]
 * }
 */
router.get("/vessel/:vesselId", getVoyagesByVessel);

export default router;
