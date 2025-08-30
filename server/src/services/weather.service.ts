import { WeatherResponse } from "../types/response.js";
import { ForecastData, MarineWeatherData, WeatherData } from "../types/data.js";
import {
  generateCacheKey,
  getCachedData,
  setCachedData,
} from "../utils/cache.js";
import { WEATHER_CONFIG } from "../config/weather.js";
import { makeWeatherRequest } from "../utils/weather.js";
import {
  transformCurrentWeather,
  transformForecastData,
} from "../utils/dataTransformer.js";
import { redisClient } from "../config/redis.js";

export const fetchRealTimeWeather = async (
  lat: number,
  lon: number
): Promise<WeatherResponse<WeatherData>> => {
  const cacheKey = generateCacheKey("realtime", lat, lon);

  try {
    // Check cache first
    const cachedData = await getCachedData<WeatherData>(cacheKey);
    if (cachedData) {
      return {
        success: true,
        data: cachedData,
        source: "cache",
      };
    }

    // Build API URL with comprehensive parameters
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current_weather: "true",
      hourly:
        "relativehumidity_2m,surface_pressure,visibility,cloudcover,precipitation",
      timezone: "auto",
      forecast_days: "1",
    });

    const url = `${WEATHER_CONFIG.API_BASE_URL}/forecast?${params}`;
    const response = await makeWeatherRequest(url);

    // Transform and cache the data
    const weatherData = transformCurrentWeather(response.data, lat, lon);
    await setCachedData(cacheKey, weatherData, WEATHER_CONFIG.CACHE_TTL);

    return {
      success: true,
      data: weatherData,
      source: "api",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      source: "api",
    };
  }
};

export const fetchWeatherForecast = async (
  lat: number,
  lon: number,
  days: number = 10
): Promise<WeatherResponse<ForecastData>> => {
  const cacheKey = generateCacheKey(`forecast_${days}d`, lat, lon);

  try {
    // Check cache first
    const cachedData = await getCachedData<ForecastData>(cacheKey);
    if (cachedData) {
      return {
        success: true,
        data: cachedData,
        source: "cache",
      };
    }

    // Build API URL for forecast
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: [
        "temperature_2m_max",
        "temperature_2m_min",
        "windspeed_10m_max",
        "winddirection_10m_dominant",
        "surface_pressure_mean",
        "cloudcover_mean",
        "precipitation_sum",
        "weathercode",
      ].join(","),
      timezone: "auto",
      forecast_days: Math.min(days, 16).toString(), // Open-Meteo max is 16 days
    });

    const url = `${WEATHER_CONFIG.API_BASE_URL}/forecast?${params}`;
    const response: any = await makeWeatherRequest(url);

    // Transform and cache the data
    const forecastData = transformForecastData(response.data, lat, lon);
    await setCachedData(cacheKey, forecastData, WEATHER_CONFIG.CACHE_TTL);

    return {
      success: true,
      data: forecastData,
      source: "api",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      source: "api",
    };
  }
};

// Marine weather for maritime applications
export const fetchMarineWeather = async (
  lat: number,
  lon: number
): Promise<WeatherResponse<MarineWeatherData>> => {
  const cacheKey = generateCacheKey("marine", lat, lon);

  try {
    // Check cache
    const cachedData = await getCachedData<MarineWeatherData>(cacheKey);
    if (cachedData) {
      return { success: true, data: cachedData, source: "cache" };
    }

    // Prepare marine API request
    const marineParams = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: [
        "wave_height",
        "wave_direction",
        "wave_period",
        "wind_wave_height",
        "wind_wave_direction",
        "swell_wave_height",
        "swell_wave_direction",
      ].join(","),
      timezone: "auto",
      forecast_days: "1",
    });
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?${marineParams}`;

    // Prepare forecast API request for rest of the data
    const forecastParams = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current_weather: "true", // <-- This was the missing part
      hourly: [
        "relativehumidity_2m",
        "surface_pressure",
        "visibility",
        "cloudcover",
        "precipitation",
      ].join(","),
      timezone: "auto",
      forecast_days: "1",
    });
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?${forecastParams}`;

    // Call both APIs in parallel
    const [marineRes, forecastRes] = await Promise.all([
      makeWeatherRequest(marineUrl),
      makeWeatherRequest(forecastUrl),
    ]);

    if (!marineRes.data || !forecastRes.data) {
      throw new Error("Empty response from one or both APIs");
    }

    // Merge API responses
    const mergedData = {
      ...forecastRes.data,
      hourly: {
        ...forecastRes.data.hourly,
        ...marineRes.data.hourly,
      },
    };

    // Transform combined data
    const baseWeather = transformCurrentWeather(mergedData, lat, lon);

    // Add wave/swell height explicitly for convenience
    const finalData: MarineWeatherData = {
      ...baseWeather,
      waveHeight: marineRes.data.hourly?.wave_height?.[0],
      waveDirection: marineRes.data.hourly?.wave_direction?.[0],
      wavePeriod: marineRes.data.hourly?.wave_period?.[0],
      windWaveHeight: marineRes.data.hourly?.wind_wave_height?.[0],
      windWaveDirection: marineRes.data.hourly?.wind_wave_direction?.[0],
      swellWaveHeight: marineRes.data.hourly?.swell_wave_height?.[0],
      swellWaveDirection: marineRes.data.hourly?.swell_wave_direction?.[0],
    };

    // Cache the result
    await setCachedData(cacheKey, finalData, WEATHER_CONFIG.CACHE_TTL);

    return { success: true, data: finalData, source: "api" };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      source: "api",
    };
  }
};

// Health check function
export const checkWeatherServiceHealth = async (): Promise<{
  api: boolean;
  cache: boolean;
}> => {
  try {
    const [apiCheck, cacheCheck] = await Promise.allSettled([
      makeWeatherRequest(
        `${WEATHER_CONFIG.API_BASE_URL}/forecast?latitude=0&longitude=0&current_weather=true`
      ),
      redisClient.ping(),
    ]);

    return {
      api: apiCheck.status === "fulfilled",
      cache: cacheCheck.status === "fulfilled",
    };
  } catch (error) {
    return { api: false, cache: false };
  }
};
