// src/services/cost.service.ts
import { calculateBearing, haversineDistance } from "../utils/location.js";
import { getVesselById } from "./vessel.service.js";
import { getVoyageById } from "./voyage.service.js";
import { fetchMarineWeather } from "./weather.service.js";

const calculateResistanceFactor = (
  vesselBearing: number,
  weatherDirection: number,
  weatherMagnitude: number
): number => {
  // Normalize the angle difference to be between 0 and 180
  const angleDifference = Math.abs(
    180 - Math.abs(vesselBearing - weatherDirection)
  );

  // Headwind/Head sea (angle difference is small, 0-45 degrees)
  if (angleDifference <= 45) {
    // Higher magnitude = more resistance
    return 1.0 + weatherMagnitude / 50; // Simple linear scaling
  }
  // Following wind/sea (angle difference is large, 135-180 degrees)
  else if (angleDifference >= 135) {
    // Higher magnitude = more assistance (reduces fuel burn)
    return 1.0 - weatherMagnitude / 75;
  }
  // Beam sea/wind (from the side)
  else {
    // Some resistance due to corrective steering
    return 1.0 + weatherMagnitude / 100;
  }
};

export const calculateAdvancedVoyageCosts = async (
  voyageId: string,
  fuelPricePerTon: number
) => {
  const voyage = await getVoyageById(voyageId);
  if (!voyage || !voyage.route_waypoints || voyage.route_waypoints.length < 2) {
    throw new Error("Voyage not found or route is incomplete.");
  }

  const vessel = await getVesselById(voyage.vessel_id);
  if (!vessel) {
    throw new Error("Vessel not found.");
  }

  let totalFuelConsumed = 0;

  for (let i = 0; i < voyage.route_waypoints.length - 1; i++) {
    const startPoint = voyage.route_waypoints[i];
    const endPoint = voyage.route_waypoints[i + 1];

    // 1. Calculate leg distance and bearing
    const legDistance = haversineDistance(
      startPoint.latitude,
      startPoint.longitude,
      endPoint.latitude,
      endPoint.longitude
    );
    const vesselBearing = calculateBearing(
      startPoint.latitude,
      startPoint.longitude,
      endPoint.latitude,
      endPoint.longitude
    );

    // 2. Get weather for the midpoint of the leg
    const midPointLat = (startPoint.latitude + endPoint.latitude) / 2;
    const midPointLon = (startPoint.longitude + endPoint.longitude) / 2;
    const weatherResponse = await fetchMarineWeather(midPointLat, midPointLon);

    if (!weatherResponse.success || !weatherResponse.data) {
      // If weather fails, use a default factor
      totalFuelConsumed += legDistance * (vessel.fuel_consumption_rate || 0.2);
      continue;
    }

    const weather = weatherResponse.data;

    // 3. Calculate resistance from wind and waves
    const windResistance = calculateResistanceFactor(
      vesselBearing,
      weather.windDirection,
      weather.windSpeed
    );
    const waveResistance = calculateResistanceFactor(
      vesselBearing,
      weather.waveDirection || 0,
      weather.waveHeight || 0
    );

    // Average the resistance factors (or use a more complex formula)
    const totalResistanceFactor = (windResistance + waveResistance) / 2;

    // 4. Calculate fuel for this leg
    const fuelForLeg =
      legDistance *
      (vessel.fuel_consumption_rate || 0.2) *
      totalResistanceFactor;
    totalFuelConsumed += fuelForLeg;
  }

  const totalFuelCost = totalFuelConsumed * fuelPricePerTon;

  return {
    // ... (return other details like total distance, etc.)
    estimatedFuelConsumptionTons: totalFuelConsumed,
    fuelCost: totalFuelCost,
  };
};
