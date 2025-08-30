import { Request, Response } from "express";
import { calculateAdvancedVoyageCosts } from "../services/cost.service.js";

export const getVoyageCost = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { voyageId } = req.params;
    const { fuelPrice } = req.query;

    // 1. Validate required parameters
    if (!voyageId) {
      return res
        .status(400)
        .json({ success: false, message: "Voyage ID is required in the URL." });
    }

    if (!fuelPrice || isNaN(parseFloat(fuelPrice as string))) {
      return res.status(400).json({
        success: false,
        message: "A valid numeric 'fuelPrice' query parameter is required.",
      });
    }

    // 2. Call the service to perform the calculation
    // Using the more detailed `calculateAdvancedVoyageCosts` function
    const costDetails = await calculateAdvancedVoyageCosts(
      voyageId,
      parseFloat(fuelPrice as string)
    );

    // 3. Send a successful response
    return res.status(200).json({
      success: true,
      message: "Voyage cost calculated successfully.",
      data: costDetails,
      metadata: {
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
      },
    });
  } catch (error: any) {
    // 4. Handle potential errors gracefully
    console.error("Error calculating voyage cost:", error);

    // Provide specific feedback if the voyage or vessel isn't found
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    // General server error for other issues
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
