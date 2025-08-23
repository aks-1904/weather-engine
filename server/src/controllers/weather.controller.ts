import { NextFunction, Request, Response } from "express";
import {
  WeatherControllerResponse,
  WeatherResponse,
} from "../types/response.js";
import {
  calculateOptimalSpeed,
  calculateOptimalSpeedForVessel,
  validateLatLon,
} from "../utils/weather.js";
import {
  checkWeatherServiceHealth,
  fetchMarineWeather,
  fetchRealTimeWeather,
  fetchWeatherForecast,
} from "../services/weather.service.js";
import {
  MarineSpeedRecommendation,
  MarineWeatherData,
  SpeedRecommendation,
  WeatherData,
} from "../types/data.js";

const createResponse = <T>(
  apiResponse: WeatherResponse<T>,
  processingTimeMs: number
): WeatherControllerResponse<T> => ({
  success: apiResponse.success,
  data: apiResponse.data || undefined,
  error: apiResponse.error,
  metadata: {
    source: apiResponse.source,
    timestamp: Date.now(),
    processingTimeMs,
  },
});

export const getRealTimeWeather = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startTime = Date.now();
  const { lat, lon } = req.query as { lat: string; lon: string };

  const coordinates = validateLatLon(lat, lon);
  if (!coordinates) {
    res.status(400).json({
      success: false,
      error:
        "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
    });
    return;
  }

  const result = await fetchRealTimeWeather(coordinates.lat, coordinates.lon);
  const response = createResponse(result, Date.now() - startTime);

  if (result.success) {
    res.json(response);
  } else {
    res.status(500).json(response);
  }
};

export const getWeatherForecast = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const startTime = Date.now();
    const { lat, lon, days } = req.query as {
      lat: string;
      lon: string;
      days?: string;
    };

    const coordinates = validateLatLon(lat, lon);
    if (!coordinates) {
      res.status(400).json({
        success: false,
        error:
          "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
      });
      return;
    }

    const forecastDays = days ? Math.min(parseInt(days), 16) : 10;
    if (isNaN(forecastDays) || forecastDays < 1) {
      res.status(400).json({
        success: false,
        error: "Days parameter must be a positive integer (max 16).",
      });
      return;
    }

    const result = await fetchWeatherForecast(
      coordinates.lat,
      coordinates.lon,
      forecastDays
    );

    const response = createResponse(result, Date.now() - startTime);

    if (result.success) {
      res.json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.log(error);
  }
};

export const getOptimalSpeed = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startTime = Date.now();
  const { lat, lon, marine } = req.query as {
    lat: string;
    lon: string;
    marine?: string;
  };

  const coordinates = validateLatLon(lat, lon);
  if (!coordinates) {
    res.status(400).json({
      success: false,
      error:
        "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
    });
    return;
  }

  if (marine === "true") {
    // Use marine API
    const weatherResult = await fetchMarineWeather(
      coordinates.lat,
      coordinates.lon
    );

    if (!weatherResult.success || !weatherResult.data) {
      res
        .status(500)
        .json(createResponse(weatherResult, Date.now() - startTime));
      return;
    }

    const speedRecommendation = calculateOptimalSpeedForVessel(
      weatherResult.data
    );

    const response: WeatherControllerResponse<{
      weather: MarineWeatherData;
      speedRecommendation: MarineSpeedRecommendation;
    }> = {
      success: true,
      data: {
        weather: weatherResult.data,
        speedRecommendation,
      },
      metadata: {
        source: weatherResult.source,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
      },
    };

    res.json(response);
  } else {
    // Use regular weather API
    const weatherResult = await fetchRealTimeWeather(
      coordinates.lat,
      coordinates.lon
    );

    if (!weatherResult.success || !weatherResult.data) {
      res
        .status(500)
        .json(createResponse(weatherResult, Date.now() - startTime));
      return;
    }

    const speedRecommendation = calculateOptimalSpeed(weatherResult.data);

    const response: WeatherControllerResponse<{
      weather: WeatherData;
      speedRecommendation: SpeedRecommendation;
    }> = {
      success: true,
      data: {
        weather: weatherResult.data,
        speedRecommendation,
      },
      metadata: {
        source: weatherResult.source,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
      },
    };

    res.json(response);
  }
};

export const getMarineWeather = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startTime = Date.now();
  const { lat, lon } = req.query as { lat: string; lon: string };

  const coordinates = validateLatLon(lat, lon);
  if (!coordinates) {
    res.status(400).json({
      success: false,
      error:
        "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
    });
    return;
  }

  const result = await fetchMarineWeather(coordinates.lat, coordinates.lon);
  const response = createResponse(result, Date.now() - startTime);

  if (result.success) {
    res.json(response);
  } else {
    res.status(500).json(response);
  }
};

export const getHealthCheck = async (
  _: Request,
  res: Response
): Promise<void> => {
  const startTime = Date.now();
  const health = await checkWeatherServiceHealth();

  const overallHealth = health.api && health.cache;

  res.status(overallHealth ? 200 : 503).json({
    success: overallHealth,
    data: {
      api: health.api ? "healthy" : "unhealthy",
      cache: health.cache ? "healthy" : "unhealthy",
      uptime: process.uptime(),
    },
    metadata: {
      timestamp: Date.now(),
      processingTimeMs: Date.now() - startTime,
    },
  });
};
