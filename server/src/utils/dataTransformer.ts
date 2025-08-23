import { ForecastData, WeatherData } from "../types/data.js";

// Functions for data transformation
export const transformCurrentWeather = (
  data: any,
  lat: number,
  lon: number
): WeatherData => ({
  temperature: data.current_weather?.temperature || 0,
  humidity: data.hourly?.relativehumidity_2m?.[0] || 0,
  windSpeed: data.current_weather?.windspeed || 0,
  windDirection: data.current_weather?.winddirection || 0,
  pressure: data.hourly?.surface_pressure?.[0] || 0,
  visibility: data.hourly?.visibility?.[0] || 10000,
  cloudCover: data.hourly?.cloudcover?.[0] || 0,
  precipitation: data.hourly?.precipitation?.[0] || 0,
  weatherCode: data.current_weather?.weathercode || 0,
  timestamp: Date.now(),
  location: { lat, lon },
});

export const transformForecastData = (
  data: any,
  lat: number,
  lon: number
): ForecastData => ({
  daily: data.daily.time.map((date: string, index: number) => ({
    temperature:
      (data.daily?.temperature_2m_max?.[index] +
        data.daily?.temperature_2m_min?.[index]) /
        2 || 0,
    windSpeed: data.daily.windspeed_10m_max?.[index] || 0,
    windDirection: data.daily.winddirection_10m_dominant?.[index] || 0,
    pressure: data.daily.surface_pressure_mean?.[index] || 0,
    cloudCover: data.daily.cloudcover_mean?.[index] || 0,
    precipitation: data.daily.precipitation_sum?.[index] || 0,
    weatherCode: data.daily.weathercode?.[index] || 0,
    timestamp: new Date(date).getTime(),
    location: { lat, lon },
  })),
  location: { lat, lon },
});
