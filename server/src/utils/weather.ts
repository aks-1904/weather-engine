import axios, { AxiosResponse } from "axios";
import { SPEED_CONFIG, WEATHER_CONFIG } from "../config/weather.js";
import {
  ForecastData,
  SpeedRecommendation,
  WeatherData,
} from "../types/data.js";
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

// Weather code interpretation for Stormglass API
export const getWeatherCondition = (code: number): string => {
  const conditions: { [key: number]: string } = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return conditions[code] || "Unknown weather condition";
};

// Calculate wind chill factor for maritime conditions
export const calculateWindChill = (temp: number, windSpeed: number): number => {
  if (temp > 10 || windSpeed < 4.8) return temp;
  return (
    13.12 +
    0.6215 * temp -
    11.37 * Math.pow(windSpeed * 1.852, 0.16) +
    0.3965 * temp * Math.pow(windSpeed * 1.852, 0.16)
  );
};

// Calculate sea state based on wind speed (Beaufort scale)
export const getSeaState = (
  windSpeed: number
): { state: number; description: string } => {
  if (windSpeed < 1) return { state: 0, description: "Calm (glassy)" };
  if (windSpeed < 4) return { state: 1, description: "Light air (ripples)" };
  if (windSpeed < 7)
    return { state: 2, description: "Light breeze (small wavelets)" };
  if (windSpeed < 11)
    return { state: 3, description: "Gentle breeze (large wavelets)" };
  if (windSpeed < 16)
    return { state: 4, description: "Moderate breeze (small waves)" };
  if (windSpeed < 22)
    return { state: 5, description: "Fresh breeze (moderate waves)" };
  if (windSpeed < 28)
    return { state: 6, description: "Strong breeze (large waves)" };
  if (windSpeed < 34)
    return { state: 7, description: "High wind (sea heaps up)" };
  if (windSpeed < 41)
    return { state: 8, description: "Gale (moderately high waves)" };
  if (windSpeed < 48)
    return { state: 9, description: "Strong gale (high waves)" };
  if (windSpeed < 56)
    return { state: 10, description: "Storm (very high waves)" };
  if (windSpeed < 64)
    return {
      state: 11,
      description: "Violent storm (exceptionally high waves)",
    };
  return { state: 12, description: "Hurricane force (phenomenal waves)" };
};

// Detect potential cyclone conditions
export const detectCycloneConditions = (
  data: WeatherData,
  forecast?: ForecastData
): boolean => {
  const currentPressure = data.pressure;
  const currentWindSpeed = data.windSpeed;

  // Rapid pressure drop indicates developing system
  let pressureDrop = false;
  if (forecast?.daily && forecast.daily.length > 0) {
    const futurePressure = forecast.daily[0].pressure;
    pressureDrop = currentPressure - futurePressure > 5; // 5 hPa drop
  }

  return (
    currentPressure < 980 || // Very low pressure
    (currentPressure < 1000 && currentWindSpeed > 35) || // Low pressure with high winds
    (pressureDrop && currentWindSpeed > 25) // Pressure dropping with moderate winds
  );
};
