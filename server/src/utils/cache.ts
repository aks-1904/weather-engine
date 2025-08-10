import { UpdateLocationData } from "../types/data.js";
import { redisClient } from "../config/redis.js";

// Cache key generators
export const generateCacheKey = (
  type: string,
  lat: number,
  lon: number
): string => `weather:${type}:${lat.toFixed(4)}:${lon.toFixed(4)}`;

// Location Cache key generator
export const generateLocationCacheKey = (captainId: string): string =>
  `captain:${captainId}:location`;

// Cache operations (pure functions)
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
};

export const setCachedData = async <T>(
  key: string,
  data: T,
  ttl: number
): Promise<void> => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error("Cache write error:", error);
  }
};
