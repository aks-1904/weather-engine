import { AlertRules, ForecastData, WeatherData } from "../types/data.js";
import {
  calculateWindChill,
  detectCycloneConditions,
  getSeaState,
  getWeatherCondition,
} from "./weather.js";

export const alertRules: AlertRules[] = [
  // EMERGENCY ALERTS
  {
    type: "hurricane_force_winds",
    severity: "emergency",
    priority: 1,
    category: "wind",
    check: (data: WeatherData) => data.windSpeed >= 64,
    message: (data: WeatherData) =>
      `🚨 HURRICANE FORCE WINDS: ${data.windSpeed} knots - ${
        getSeaState(data.windSpeed).description
      }`,
    recommendations: [
      "SEEK IMMEDIATE SHELTER",
      "Avoid all vessel operations",
      "Emergency protocols in effect",
      "Monitor emergency channels",
    ],
    debounceTime: 30,
  },
  {
    type: "cyclone_threat",
    severity: "emergency",
    priority: 1,
    category: "cyclone",
    check: (data: WeatherData, forecast?: ForecastData) =>
      detectCycloneConditions(data, forecast),
    message: (data: WeatherData) =>
      `🌀 CYCLONE CONDITIONS DETECTED: Pressure ${data.pressure}hPa, Winds ${data.windSpeed}kts`,
    recommendations: [
      "Evacuate area immediately",
      "Secure all equipment",
      "Follow emergency evacuation routes",
      "Contact maritime authorities",
    ],
    debounceTime: 60,
  },

  // CRITICAL ALERTS
  {
    type: "violent_storm",
    severity: "critical",
    priority: 2,
    category: "wind",
    check: (data: WeatherData) => data.windSpeed >= 56 && data.windSpeed < 64,
    message: (data: WeatherData) =>
      `⛈️ VIOLENT STORM: ${data.windSpeed} knots - Exceptionally dangerous seas`,
    recommendations: [
      "Seek safe harbor immediately",
      "Avoid all non-essential operations",
      "Secure all loose equipment",
      "Monitor weather updates constantly",
    ],
    debounceTime: 45,
  },
  {
    type: "zero_visibility",
    severity: "critical",
    priority: 1,
    category: "visibility",
    check: (data: WeatherData) => data.visibility < 100,
    message: (data: WeatherData) =>
      `🌫️ ZERO VISIBILITY: ${data.visibility}m - Navigation extremely hazardous`,
    recommendations: [
      "Stop all vessel movement",
      "Use radar navigation only",
      "Sound fog signals",
      "Post additional lookouts",
    ],
    debounceTime: 30,
  },
  {
    type: "extreme_cold_exposure",
    severity: "critical",
    priority: 2,
    category: "temperature",
    check: (data: WeatherData) => {
      const windChill = calculateWindChill(data.temperature, data.windSpeed);
      return windChill < -20 || (data.temperature < 0 && data.windSpeed > 20);
    },
    message: (data: WeatherData) => {
      const windChill = calculateWindChill(data.temperature, data.windSpeed);
      return `🥶 EXTREME COLD: Wind chill ${windChill.toFixed(
        1
      )}°C - Frostbite risk`;
    },
    recommendations: [
      "Limit crew exposure time",
      "Ensure proper cold weather gear",
      "Monitor for hypothermia symptoms",
      "Maintain heated areas",
    ],
  },

  // WARNING ALERTS
  {
    type: "gale_force_winds",
    severity: "warning",
    priority: 3,
    category: "wind",
    check: (data: WeatherData) => data.windSpeed >= 34 && data.windSpeed < 48,
    message: (data: WeatherData) =>
      `💨 GALE FORCE WINDS: ${data.windSpeed} knots - ${
        getSeaState(data.windSpeed).description
      }`,
    recommendations: [
      "Reduce vessel speed",
      "Secure deck equipment",
      "Brief crew on safety procedures",
      "Consider course adjustments",
    ],
  },
  {
    type: "dense_fog",
    severity: "warning",
    priority: 2,
    category: "visibility",
    check: (data: WeatherData) =>
      data.visibility < 1000 && data.visibility >= 100,
    message: (data: WeatherData) =>
      `🌫️ DENSE FOG: Visibility ${data.visibility}m - Navigation restricted`,
    recommendations: [
      "Reduce speed significantly",
      "Use fog signals",
      "Maintain radar watch",
      "Post additional lookouts",
    ],
  },
  {
    type: "severe_thunderstorm",
    severity: "warning",
    priority: 2,
    category: "precipitation",
    check: (data: WeatherData) =>
      data.weatherCode >= 95 &&
      (data.precipitation > 15 || data.windSpeed > 25),
    message: (data: WeatherData) =>
      `⛈️ SEVERE THUNDERSTORM: ${getWeatherCondition(
        data.weatherCode
      )} - Lightning risk`,
    recommendations: [
      "Avoid metal structures on deck",
      "Secure all electronics",
      "Monitor for waterspouts",
      "Prepare for sudden wind shifts",
    ],
  },
  {
    type: "rapid_pressure_change",
    severity: "warning",
    priority: 3,
    category: "pressure",
    check: (data: WeatherData, forecast?: ForecastData) => {
      if (!forecast?.daily || forecast.daily.length === 0) return false;
      const pressureChange = Math.abs(
        data.pressure - forecast.daily[0].pressure
      );
      return pressureChange > 3; // 3 hPa change
    },
    message: (data: WeatherData, forecast?: ForecastData) => {
      if (!forecast?.daily) return "Rapid pressure change detected";
      const change = data.pressure - forecast.daily[0].pressure;
      return `📊 PRESSURE CHANGE: ${change > 0 ? "+" : ""}${change.toFixed(
        1
      )}hPa - Weather system approaching`;
    },
    recommendations: [
      "Monitor weather closely",
      "Prepare for weather changes",
      "Check equipment security",
      "Review emergency procedures",
    ],
  },
  {
    type: "heavy_seas",
    severity: "warning",
    priority: 3,
    category: "marine",
    check: (data: WeatherData) => {
      const seaState = getSeaState(data.windSpeed);
      return seaState.state >= 6; // Force 6 or higher
    },
    message: (data: WeatherData) => {
      const seaState = getSeaState(data.windSpeed);
      return `🌊 HEAVY SEAS: ${seaState.description} - Difficult conditions`;
    },
    recommendations: [
      "Reduce speed for crew safety",
      "Secure all moveable items",
      "Brief crew on heavy weather procedures",
      "Monitor vessel stress",
    ],
  },

  // INFO ALERTS
  {
    type: "moderate_conditions",
    severity: "info",
    priority: 4,
    category: "marine",
    check: (data: WeatherData) => {
      const seaState = getSeaState(data.windSpeed);
      return seaState.state >= 4 && seaState.state < 6;
    },
    message: (data: WeatherData) => {
      const seaState = getSeaState(data.windSpeed);
      return `ℹ️ MODERATE CONDITIONS: ${seaState.description}`;
    },
    recommendations: [
      "Standard precautions apply",
      "Monitor weather updates",
      "Ensure crew safety awareness",
    ],
  },
  {
    type: "favorable_conditions",
    severity: "info",
    priority: 5,
    category: "marine",
    check: (data: WeatherData) => {
      const seaState = getSeaState(data.windSpeed);
      return (
        seaState.state <= 3 && data.visibility > 5000 && data.precipitation < 1
      );
    },
    message: (data: WeatherData) =>
      `☀️ FAVORABLE CONDITIONS: Good visibility, calm seas`,
    recommendations: [
      "Optimal conditions for operations",
      "Consider planned maintenance",
      "Good time for crew training",
    ],
  },
];
