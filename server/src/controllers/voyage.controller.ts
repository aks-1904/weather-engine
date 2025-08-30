import { Request, Response } from "express";
import {
  createVoyage as createVoyageService,
  updateVoyage as updateVoyageService,
  deleteVoyage as deleteVoyageService,
  getVoyagesByVessel as getVoyagesByVesselService,
  getAllVoyages as getAllVoyagesService,
  getVoyageById as getVoyageByIdService,
} from "../services/voyage.service.js";
import { VoyageResponse } from "../types/response.js";

export const createVoyage = async (
  req: Request,
  res: Response<VoyageResponse>
): Promise<void> => {
  try {
    const { vessel_id, etd, eta, route_waypoints, status } = req.body;

    if (!vessel_id || !route_waypoints || !Array.isArray(route_waypoints)) {
      res.status(400).json({
        success: false,
        message: "Vessel, routes are required",
      });
      return;
    }

    // Validate dates if provided
    if (etd && eta && new Date(etd) >= new Date(eta)) {
      res.status(400).json({
        success: false,
        message: "ETD must be before ETA",
      });
      return;
    }

    // Validate route waypoints if provided
    if (route_waypoints && !Array.isArray(route_waypoints)) {
      res.status(400).json({
        success: false,
        message: "Route waypoints must be an array",
      });
      return;
    }

    const voyage = await createVoyageService({
      vessel_id,
      route_waypoints,
      etd: etd ? new Date(etd) : null,
      eta: eta ? new Date(eta) : null,
      status: status || "planned",
    });

    res.status(201).json({
      success: true,
      message: "Voyage created successfully",
      voyage,
    });
  } catch (error: any) {
    console.error("Error creating voyage:", error);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      res.status(404).json({
        success: false,
        message: "Vessel not found",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllVoyages = async (
  req: Request,
  res: Response<VoyageResponse>
): Promise<void> => {
  try {
    const { status, vessel_id } = req.query;

    const voyages = await getAllVoyagesService({
      status: status as string,
      vessel_id: vessel_id as string,
    });

    res.status(200).json({
      success: true,
      message: "Voyages retrieved successfully",
      voyages,
    });
  } catch (error) {
    console.error("Error fetching voyages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getVoyageById = async (
  req: Request,
  res: Response<VoyageResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Voyage ID is required",
      });
      return;
    }

    const voyage = await getVoyageByIdService(id);

    if (!voyage) {
      res.status(404).json({
        success: false,
        message: "Voyage not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Voyage retrieved successfully",
      voyage,
    });
  } catch (error) {
    console.error("Error fetching voyage:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateVoyage = async (
  req: Request,
  res: Response<VoyageResponse>
) => {
  try {
    const { id } = req.params;
    const { status, origin_port, destination_port, etd, eta, route_waypoints } =
      req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Voyage ID is required",
      });
      return;
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (origin_port !== undefined) updateData.origin_port = origin_port;
    if (destination_port !== undefined)
      updateData.destination_port = destination_port;
    if (etd !== undefined) updateData.etd = etd ? new Date(etd) : null;
    if (eta !== undefined) updateData.eta = eta ? new Date(eta) : null;
    if (route_waypoints !== undefined)
      updateData.route_waypoints = route_waypoints;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
      return;
    }

    // Validate dates if both are being updated
    if (updateData.etd && updateData.eta && updateData.etd >= updateData.eta) {
      res.status(400).json({
        success: false,
        message: "ETD must be before ETA",
      });
      return;
    }

    const voyage = await updateVoyageService(id, updateData);

    if (!voyage) {
      res.status(404).json({
        success: false,
        message: "Voyage not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Voyage updated successfully",
      voyage,
    });
  } catch (error) {
    console.error("Error updating voyage:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteVoyage = async (
  req: Request,
  res: Response<VoyageResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Voyage ID is required",
      });
      return;
    }

    const deleted = await deleteVoyageService(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Voyage not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Voyage deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting voyage:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getVoyagesByVessel = async (
  req: Request,
  res: Response<VoyageResponse>
) => {
  try {
    const { vesselId } = req.params;
    const { status } = req.query;

    if (!vesselId) {
      res.status(400).json({
        success: false,
        message: "Vessel ID is required",
      });
      return;
    }

    const voyages = await getVoyagesByVesselService(vesselId, status as string);

    res.status(200).json({
      success: true,
      message: "Voyages retrieved successfully",
      voyages,
    });
  } catch (error) {
    console.error("Error fetching voyages by vessel:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
