import {
  assignCaptain,
  createVessel,
  deleteVessel,
  getAllVessels,
  getVesselById,
  updateVessel,
} from "../controllers/vessel.controller.js";
import { Router } from "express";
import { checkRole, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes in this file are protected and require an 'analyst' role.
// The `isAuthenticated` middleware runs first, followed by `checkRole`.
// router.use(isAuthenticated, checkRole(["analyst"]));

/**
 * @route   POST /api/vessels/
 * @desc    Create a new vessel
 * @access  Private (Requires 'analyst' role)
 *
 * @body
 * {
 * "name": "The Sea Serpent",
 * "imo_number": "9876543",
 * "captain_id": "captain-uuid-123" // Optional
 * }
 *
 * @success (201 Created)
 * {
 * "success": true,
 * "message": "Vessel created successfully",
 * "vessel": {
 * "id": "vessel-uuid-456",
 * "name": "The Sea Serpent",
 * "imo_number": "9876543",
 * "captain_id": "captain-uuid-123"
 * }
 * }
 */
router.post("/", createVessel);

/**
 * @route   GET /api/vessels/
 * @desc    Get a list of all vessels
 * @access  Private (Requires 'analyst' role)
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Vessels retrieved successfully",
 * "vessels": [
 * {
 * "id": "vessel-uuid-456",
 * "name": "The Sea Serpent",
 * "imo_number": "9876543",
 * "captain_id": "captain-uuid-123"
 * },
 * {
 * "id": "vessel-uuid-789",
 * "name": "The Ocean Wanderer",
 * "imo_number": "1234567",
 * "captain_id": null
 * }
 * ]
 * }
 */
router.get("/", getAllVessels);

/**
 * @route   GET /api/vessels/:id
 * @desc    Get a single vessel by its unique ID
 * @access  Private (Requires 'analyst' role)
 *
 * @params
 * id: "vessel-uuid-456"
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Vessel retrieved successfully",
 * "vessel": {
 * "id": "vessel-uuid-456",
 * "name": "The Sea Serpent",
 * "imo_number": "9876543",
 * "captain_id": "captain-uuid-123"
 * }
 * }
 */
router.get("/:id", getVesselById);

/**
 * @route   PATCH /api/vessels/:id
 * @desc    Update a vessel's details
 * @access  Private (Requires 'analyst' role)
 *
 * @params
 * id: "vessel-uuid-456"
 *
 * @body (Provide only the fields to be updated)
 * {
 * "name": "The Mighty Serpent"
 * }
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Vessel updated successfully",
 * "vessel": {
 * "id": "vessel-uuid-456",
 * "name": "The Mighty Serpent",
 * "imo_number": "9876543",
 * "captain_id": "captain-uuid-123"
 * }
 * }
 */
router.patch("/:id", updateVessel);

/**
 * @route   DELETE /api/vessels/:id
 * @desc    Decommission (delete) a vessel
 * @access  Private (Requires 'analyst' role)
 *
 * @params
 * id: "vessel-uuid-456"
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Vessel decommissioned successfully"
 * }
 */
router.delete("/:id", deleteVessel);

/**
 * @route   PATCH /api/vessels/:id/assign-captain
 * @desc    Assign a captain to a specific vessel
 * @access  Private (Requires 'analyst' role)
 *
 * @params
 * id: "vessel-uuid-789"
 *
 * @body
 * {
 * "captain_id": "new-captain-uuid-987"
 * }
 *
 * @success (200 OK)
 * {
 * "success": true,
 * "message": "Captain assigned to vessel successfully",
 * "vessel": {
 * "id": "vessel-uuid-789",
 * "name": "The Ocean Wanderer",
 * "imo_number": "1234567",
 * "captain_id": "new-captain-uuid-987"
 * }
 * }
 */
router.patch("/:id/assign-captain", assignCaptain);

export default router;
