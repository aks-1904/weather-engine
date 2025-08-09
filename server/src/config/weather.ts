// Weather Api configuration
export const WEATHER_CONFIG = {
  API_BASE_URL: "https://api.open-meteo.com/v1",
  CACHE_TTL: 30 * 60, // 30 minutes in seconds
  REQUEST_TIMEOUT: 5000, // 5 seconds
} as const;

// Configuration for speed calculations
export const SPEED_CONFIG = {
  BASE_SPEED: 100, // Base speed in km/h
  WIND_THRESHOLD: 15, // km/h
  VISIBILITY_THRESHOLD: 1000, // meters
  PRECIPITATION_THRESHOLD: 1, // mm
  WAVE_THRESHOLD: 2, // meters
} as const;
