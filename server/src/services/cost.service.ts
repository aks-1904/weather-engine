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

  // Thresholds for what is considered 'strong'
  const strongWind = 25; // knots
  const highWave = 3; // meters

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

  // Headwind/Head sea (hindering the vessel)
  if (angleDifference <= 60) {
    const factor = 1.0 + magnitude / (type === "wind" ? 40 : 20);
    const insight = `${strengthLabel} head ${type} increased fuel consumption.`;
    return { factor, insight };
  }
  // Following wind/sea (assisting the vessel)
  else if (angleDifference >= 120) {
    const factor = 1.0 - magnitude / (type === "wind" ? 60 : 30);
    const insight = `Favorable following ${type} reduced fuel burn.`;
    return { factor, insight };
  }
  // Beam sea/wind (from the side)
  else {
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

  const analysisLegs = [];
  let totalFuelConsumed = 0;
  let totalDistance = 0;

  for (let i = 0; i < voyage.route_waypoints.length - 1; i++) {
    const startPoint = voyage.route_waypoints[i];
    const endPoint = voyage.route_waypoints[i + 1];

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

    const midPointLat = (startPoint.latitude + endPoint.latitude) / 2;
    const midPointLon = (startPoint.longitude + endPoint.longitude) / 2;
    const weatherResponse = await fetchMarineWeather(midPointLat, midPointLon);

    let legFuelConsumption =
      legDistance * (vessel.fuel_consumption_rate || 0.2);
    let performanceInsight = "Standard steaming conditions.";
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

      const combinedFactor = (wind.factor + wave.factor) / 2;
      legFuelConsumption *= combinedFactor;

      // Combine insights, prioritizing the one with the bigger impact
      performanceInsight =
        Math.abs(1 - wind.factor) > Math.abs(1 - wave.factor)
          ? wind.insight
          : wave.insight;
    }

    totalFuelConsumed += legFuelConsumption;
    totalDistance += legDistance;

    analysisLegs.push({
      leg: i + 1,
      startWaypoint: startPoint,
      endWaypoint: endPoint,
      distanceNm: legDistance,
      vesselBearing: vesselBearing,
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
      totalEstimatedFuelTons: totalFuelConsumed,
      totalEstimatedFuelCost: totalFuelCost,
      averageFuelConsumptionTonPerNm: totalFuelConsumed / totalDistance,
    },
    legs: analysisLegs,
  };
};
