import { getVoyageById } from "./voyage.service.js";
import { getVesselById } from "./vessel.service.js";
import { fetchMarineWeather } from "./weather.service.js";
import { calculateBearing, haversineDistance } from "../utils/location.js";

const calculateResistanceFactor = (
  vesselBearing: number,
  weatherDirection: number,
  weatherMagnitude: number,
  type: "wind" | "wave"
): { factor: number; insight: string } => {
  const angleDifference =
    180 - Math.abs(180 - Math.abs(vesselBearing - weatherDirection));
  const strongWind = 25;
  const highWave = 3;
  const magnitude = type === "wind" ? weatherMagnitude : weatherMagnitude;
  const isStrong =
    type === "wind" ? magnitude > strongWind : magnitude > highWave;
  const strengthLabel = isStrong
    ? type === "wind"
      ? "Strong"
      : "High"
    : type === "wind"
    ? "Moderate"
    : "Moderate";

  if (angleDifference <= 60) {
    const factor = 1.0 + magnitude / (type === "wind" ? 40 : 20);
    const insight = `${strengthLabel} head ${type} increased fuel consumption.`;
    return { factor, insight };
  } else if (angleDifference >= 120) {
    const factor = 1.0 - magnitude / (type === "wind" ? 60 : 30);
    const insight = `Favorable following ${type} reduced fuel burn.`;
    return { factor, insight };
  } else {
    const factor = 1.0 + magnitude / (type === "wind" ? 80 : 40);
    const insight = `${strengthLabel} beam ${type} caused minor resistance.`;
    return { factor, insight };
  }
};

export const calculateAdvancedVoyageCosts = async (
  voyageId: string,
  fuelPricePerTon: number
) => {
  const voyage = await getVoyageById(voyageId);
  if (
    !voyage ||
    !voyage.route_waypoints ||
    voyage.route_waypoints?.length < 2
  ) {
    throw new Error("No voyage or incomplete route.");
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
      startPoint.lat,
      startPoint.lon,
      endPoint.lat,
      endPoint.lon
    );
    const vesselBearing = calculateBearing(
      startPoint.lat,
      startPoint.lon,
      endPoint.lat,
      endPoint.lon
    );

    // 2. Get weather for the midpoint of the leg
    const midPointLat = (startPoint.lat + endPoint.lat) / 2;
    const midPointLon = (startPoint.lon + endPoint.lon) / 2;
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
      weather.windSpeed,
      "wind"
    );
    const waveResistance = calculateResistanceFactor(
      vesselBearing,
      weather.waveDirection || 0,
      weather.waveHeight || 0,
      "wave"
    );

    // Average the resistance factors (or use a more complex formula)
    const totalResistanceFactor =
      (windResistance.factor + waveResistance.factor) / 2;

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

export const getDetailedVoyageAnalysis = async (
  voyageId: string,
  fuelPricePerTon: number
) => {
  const voyage = await getVoyageById(voyageId);
  if (!voyage || !voyage.route_waypoints || voyage.route_waypoints.length < 2) {
    throw new Error("Voyage not found or route is incomplete for analysis.");
  }

  const vessel = await getVesselById(voyage.vessel_id);
  if (!vessel) {
    throw new Error("Vessel not found for analysis.");
  }

  // Use the eco_speed_knots from the database as the baseline
  const baseSpeed = vessel.eco_speed_knots
    ? parseFloat(vessel.eco_speed_knots.toString())
    : 12.0;

  const analysisLegs = [];
  let totalFuelConsumed = 0;
  let totalDistance = 0;
  let totalDurationHours = 0;

  for (let i = 0; i < voyage.route_waypoints.length - 1; i++) {
    const startPoint = voyage.route_waypoints[i];
    const endPoint = voyage.route_waypoints[i + 1];

    const legDistance = haversineDistance(
      startPoint.lat,
      startPoint.lon,
      endPoint.lat,
      endPoint.lon
    );
    const vesselBearing = calculateBearing(
      startPoint.lat,
      startPoint.lon,
      endPoint.lat,
      endPoint.lon
    );

    const midPointLat = (startPoint.lat + endPoint.lat) / 2;
    const midPointLon = (startPoint.lon + endPoint.lon) / 2;
    const weatherResponse = await fetchMarineWeather(midPointLat, midPointLon);

    let combinedFactor = 1.0;
    let adjustedSpeedKnots = baseSpeed;
    let legDurationHours = legDistance / adjustedSpeedKnots;
    let performanceInsight =
      "Standard steaming conditions, maintaining eco-speed.";
    let weatherDataForLeg = null;

    if (weatherResponse.success && weatherResponse.data) {
      const weather = weatherResponse.data;
      weatherDataForLeg = {
        windSpeed: weather.windSpeed,
        windDirection: weather.windDirection,
        waveHeight: weather.waveHeight,
        waveDirection: weather.waveDirection,
      };

      const wind = calculateResistanceFactor(
        vesselBearing,
        weather.windDirection,
        weather.windSpeed,
        "wind"
      );
      const wave = calculateResistanceFactor(
        vesselBearing,
        weather.waveDirection || 0,
        weather.waveHeight || 0,
        "wave"
      );

      combinedFactor = (wind.factor + wave.factor) / 2;
      performanceInsight =
        Math.abs(1 - wind.factor) > Math.abs(1 - wave.factor)
          ? wind.insight
          : wave.insight;

      // Calculate the new adjusted speed and duration for the leg
      adjustedSpeedKnots = calculateAdjustedSpeed(baseSpeed, combinedFactor);
      legDurationHours = legDistance / adjustedSpeedKnots;
    }

    const legFuelConsumption =
      legDistance * (vessel.fuel_consumption_rate || 0.2) * combinedFactor;

    totalFuelConsumed += legFuelConsumption;
    totalDistance += legDistance;
    totalDurationHours += legDurationHours;

    analysisLegs.push({
      leg: i + 1,
      startWaypoint: startPoint,
      endWaypoint: endPoint,
      distanceNm: legDistance,
      vesselBearing: vesselBearing,
      baseSpeedKnots: baseSpeed,
      adjustedSpeedKnots: adjustedSpeedKnots,
      estimatedDurationHours: legDurationHours,
      weather: weatherDataForLeg,
      fuelConsumptionTons: legFuelConsumption,
      fuelCost: legFuelConsumption * fuelPricePerTon,
      performanceInsight,
    });
  }

  const totalFuelCost = totalFuelConsumed * fuelPricePerTon;

  return {
    summary: {
      voyageId,
      totalDistanceNm: totalDistance,
      totalEstimatedDurationDays: totalDurationHours / 24,
      totalEstimatedFuelTons: totalFuelConsumed,
      totalEstimatedFuelCost: totalFuelCost,
      averageFuelConsumptionTonPerNm: totalFuelConsumed / totalDistance,
    },
    legs: analysisLegs,
  };
};

const calculateAdjustedSpeed = (
  baseSpeedKnots: number,
  resistanceFactor: number
): number => {
  // If weather is unfavorable (resistance > 1), speed is reduced.
  // The reduction is proportional to the resistance. A factor of 1.2 might reduce speed by 20%.
  if (resistanceFactor > 1) {
    // The divisor ensures that extreme resistance has a larger impact on speed.
    return baseSpeedKnots / (1 + (resistanceFactor - 1) * 0.8);
  }
  // If weather is favorable (resistance < 1), speed is slightly increased.
  else if (resistanceFactor < 1) {
    // We assume the vessel captain will capitalize on good conditions, but not drastically.
    return baseSpeedKnots * (1 + (1 - resistanceFactor) * 0.2);
  }
  // No significant impact.
  return baseSpeedKnots;
};
