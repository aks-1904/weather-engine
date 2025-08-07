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

// All voyage routes are protected by analyst role
router.use(isAuthenticated, checkRole(["analyst"]));

// POST /api/voyages - Create a new voyage plan with a route
router.post("/", createVoyage);

// GET /api/vessels - Get all vessels
router.get("/", getAllVoyages);

// GET /api/voyages/:id - Get a single voyage
router.get("/:id", getVoyageById);

// PATCH /api/voyages/:id - Update voyage details
router.patch("/:id", updateVoyage);

// DELETE /api/voyages/:id - Delete a voyage
router.delete("/:id", deleteVoyage);

// GET /api/voyages/vessel/:vesselId - Get voyages by vessel ID
router.get("/vessel/:vesselId", getVoyagesByVessel);

export default router;
