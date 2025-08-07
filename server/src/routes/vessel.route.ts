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

// All vessel routes are protected by analyst role
router.use(isAuthenticated, checkRole(["analyst"]));

// POST /api/vessels - Create a new vessel
router.post("/", createVessel);

// GET /api/vessels - Get all vessels
router.get("/", getAllVessels);

// GET /api/vessels/:id - Get a single vessel
router.get("/:id", getVesselById);

// PATCH /api/vessels/:id - Update vessel details
router.patch("/:id", updateVessel);

// DELETE /api/vessels/:id - Decommission a vessel
router.delete("/:id", deleteVessel);

// PATCH /api/vessels/:id/assign-captain - Assign captain to vessel
router.patch("/:id/assign-captain", assignCaptain);

export default router;
