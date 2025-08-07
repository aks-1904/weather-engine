import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createVessel as createVesselService,
  getAllVessels as getAllVesselsService,
  getVesselById as getVesselByIdService,
  updateVessel as updateVesselService,
} from "../services/vessel.service.js";
import { VesselResponse } from "../types/response.js";
import { CreateVesselData, UpdateVesselData } from "../types/credential.js";

export const createVessel = async (
  req: AuthenticatedRequest,
  res: Response<VesselResponse>
): Promise<void> => {
  try {
    const { name, imo_number, captain_id }: CreateVesselData = req.body;

    // Checking for required fields
    if (!name || !imo_number) {
      res.status(400).json({
        success: false,
        message: "Name and IMO number are required",
      });
      return;
    }

    const vessel = await createVesselService({
      // Creating vessel in db
      name,
      imo_number,
      captain_id: captain_id || null,
    });

    res.status(201).json({
      success: true,
      message: "Vessel created successfully",
      vessel,
    });
    return;
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      // Return with error if IMO number already exists
      res.status(409).json({
        success: false,
        message: "Vessel with this IMO number already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const getAllVessels = async (
  _: Request,
  res: Response<VesselResponse>
): Promise<void> => {
  try {
    const vessels = await getAllVesselsService(); // Getting all vessels data

    res.status(200).json({
      success: true,
      message: "Vessels retrieved successfully",
      vessels, // Vessels[]
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const getVesselById = async (
  req: Request,
  res: Response<VesselResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    // Checking for incoming data
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Vessel ID is required",
      });
      return;
    }

    const vessel = await getVesselByIdService(id);
    if (!vessel) {
      res.status(404).json({
        success: false,
        message: "Vessel not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vessel retrieved successfully",
      vessel,
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const updateVessel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, imo_number, captain_id }: UpdateVesselData = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Vessel ID is required",
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (imo_number !== undefined) updateData.imo_number = imo_number;
    if (captain_id !== undefined) updateData.captain_id = captain_id;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
      return;
    }

    // Updating vessel data
    const vessel = await updateVesselService(id, updateData);

    if (!vessel) {
      res.status(404).json({
        success: false,
        message: "Vessel not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vessel updated successfully",
      data: vessel,
    });
  } catch (error) {}
};
