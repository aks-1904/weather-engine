import { getCachedData } from "./cache.js";

export const hasSignificantLocationChangeOrTimChange = async (
  captain_id: string,
  newLat: number,
  newLon: number,
  thresholdKm: number = 0.5,
  timeThresholdMin: number = 10 // minutes
): Promise<boolean> => {
  try {
    const cacheKey = `captain:${captain_id}:location`;
    const lastData = await getCachedData<{
      lat: number;
      lon: number;
      lastCheck?: number;
    }>(cacheKey);

    const now = Date.now();

    if (!lastData) {
      // No previous location, treat as change
      return true;
    }

    const minutesSinceLastCheck = lastData.lastCheck
      ? (now - lastData.lastCheck) / (1000 * 60)
      : Infinity;

    const distanceKm = haversineDistance(
      lastData.lat,
      lastData.lon,
      newLat,
      newLon
    );

    // Trigger if distance is large OR enough time has passed
    return (
      distanceKm >= thresholdKm || minutesSinceLastCheck >= timeThresholdMin
    );
  } catch (error) {
    console.error("Error checking location change:", error);
    // Fail-safe: treat as changed so alerts are not skipped
    return true;
  }
};

// Haversine distance calculation
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
