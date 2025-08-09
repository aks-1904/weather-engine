import axios, { AxiosResponse } from "axios";
import { SPEED_CONFIG, WEATHER_CONFIG } from "../config/weather.js";
import { SpeedRecommendation, WeatherData } from "../types/data.js";
import { validateCoordinates } from "./validators.js";

// HTTP client with error handling
export const makeWeatherRequest = async (
  url: string
): Promise<AxiosResponse> => {
  try {
    return await axios.get(url, {
      timeout: WEATHER_CONFIG.REQUEST_TIMEOUT,
      headers: {
        "User-Agent": "WeatherEngine/1.0",
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Weather API request failed: ${error.message}`);
    }
    throw error;
  }
};

// Function for speed calculation
export const calculateWindSpeedFactor = (windSpeed: number): number => {
  if (windSpeed <= SPEED_CONFIG.WIND_THRESHOLD) return 1.0;
  if (windSpeed <= 25) return 0.9;
  if (windSpeed <= 40) return 0.7;
  if (windSpeed <= 60) return 0.5;
  return 0.3;
};

// Function for visibility factor
export const calculateVisibilityFactor = (visibility: number): number => {
  if (visibility >= 10000) return 1.0;
  if (visibility >= 5000) return 0.9;
  if (visibility >= 2000) return 0.7;
  if (visibility >= 1000) return 0.5;
  if (visibility >= 500) return 0.3;
  return 0.1;
};

// Function for precipitaion factor
export const calculatePrecipitationFactor = (precipitation: number): number => {
  if (precipitation === 0) return 1.0;
  if (precipitation <= 1) return 0.9;
  if (precipitation <= 5) return 0.7;
  if (precipitation <= 10) return 0.5;
  return 0.3;
};

// Function for wave factore
export const calculateWaveFactor = (waveHeight?: number): number => {
  if (!waveHeight) return 1.0;
  if (waveHeight <= 1) return 1.0;
  if (waveHeight <= 2) return 0.9;
  if (waveHeight <= 3) return 0.7;
  if (waveHeight <= 4) return 0.5;
  return 0.3;
};

export const determineRiskLevel = (factors: {
  windSpeedFactor: number;
  visibilityFactor: number;
  precipitationFactor: number;
  waveFactor?: number;
}): "LOW" | "MEDIUM" | "HIGH" | "EXTREME" => {
  const minFactor = Math.min(
    factors.windSpeedFactor,
    factors.visibilityFactor,
    factors.precipitationFactor,
    factors.waveFactor || 1.0
  );

  if (minFactor >= 0.9) return "LOW";
  if (minFactor >= 0.7) return "MEDIUM";
  if (minFactor >= 0.5) return "HIGH";
  return "EXTREME";
};

export const generateRecommendations = (
  weather: WeatherData & { waveHeight?: number },
  riskLevel: string
): string[] => {
  const recommendations: string[] = [];

  if (weather.windSpeed > 40) {
    recommendations.push("Extreme wind conditions - consider delaying journey");
  } else if (weather.windSpeed > 25) {
    recommendations.push(
      "Strong winds detected - reduce speed and increase following distance"
    );
  }

  if (weather.visibility < 1000) {
    recommendations.push(
      "Poor visibility - use fog lights and maintain extra caution"
    );
  }

  if (weather.precipitation > 5) {
    recommendations.push(
      "Heavy precipitation - significantly reduce speed and increase braking distance"
    );
  }

  if (weather.waveHeight && weather.waveHeight > 3) {
    recommendations.push("High waves - maritime vessels should seek shelter");
  }

  if (riskLevel === "EXTREME") {
    recommendations.push(
      "EXTREME weather conditions - strongly consider postponing travel"
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Weather conditions are favorable for travel");
  }

  return recommendations;
};

export const calculateOptimalSpeed = (
  weather: WeatherData & { waveHeight?: number }
): SpeedRecommendation => {
  const factors = {
    windSpeedFactor: calculateWindSpeedFactor(weather.windSpeed),
    visibilityFactor: calculateVisibilityFactor(weather.visibility),
    precipitationFactor: calculatePrecipitationFactor(weather.precipitation),
    waveFactor: calculateWaveFactor(weather.waveHeight),
  };

  const combinedFactor = Math.min(
    factors.windSpeedFactor,
    factors.visibilityFactor,
    factors.precipitationFactor,
    factors.waveFactor || 1.0
  );

  const optimalSpeed = Math.round(SPEED_CONFIG.BASE_SPEED * combinedFactor);
  const maxSafeSpeed = Math.round(optimalSpeed * 1.2); // 20% buffer

  const riskLevel = determineRiskLevel(factors);
  const recommendations = generateRecommendations(weather, riskLevel);

  return {
    optimalSpeed,
    maxSafeSpeed,
    weatherFactors: factors,
    riskLevel,
    recommendations,
  };
};

export const validateLatLon = (
  lat: string,
  lon: string
): { lat: number; lon: number } | null => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    !validateCoordinates(latitude, longitude)
  ) {
    return null;
  }

  return { lat: latitude, lon: longitude };
};
