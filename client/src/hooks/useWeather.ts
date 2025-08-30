import axios from "axios";
import { useAppDispatch } from "./app";
import {
  setOptimalSpeed,
  setRealtimeWeather,
  setWeatherForecast,
} from "../store/slices/weatherSlice";

const WEATHER_API_URL = `${import.meta.env.VITE_API_BASE_URL}/weather`;

const useVessel = () => {
  const dispatch = useAppDispatch();

  const getRealTimeWeather = async (lat: number, lon: number) => {
    try {
      const res = await axios.get(
        `${WEATHER_API_URL}/realtime?lat=${lat}&lon=${lon}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (res.data?.data) {
        dispatch(setRealtimeWeather(res.data?.data));
      }
    } catch (error) {}
  };

  const getForecastData = async (lat: number, lon: number, days?: number) => {
    try {
      const res = await axios.get(
        days
          ? `${WEATHER_API_URL}/realtime?lat=${lat}&lon=${lon}`
          : `${WEATHER_API_URL}/realtime?lat=${lat}&lon=${lon}&days={${days}}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (res.data?.data) {
        dispatch(setWeatherForecast(res.data?.data));
      }
    } catch (error) {}
  };

  const getOptimalSpeed = async (lat: number, lon: number, marine: boolean) => {
    const res = await axios.get(
      `${WEATHER_API_URL}/optimal-speed?lat=${lat}&lon=${lon}&marine=${
        marine ? "true" : "false"
      }`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      }
    );

    if (res.data?.success) {
      dispatch(setOptimalSpeed(res.data?.data));
    }
  };

  const getMarineData = async (lat: number, lon: number) => {
    const res = await axios.get(
      `${WEATHER_API_URL}/marine?lat=${lat}&lon=${lon}
      }`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      }
    );

    if (res.data?.success) {
      dispatch(setOptimalSpeed(res.data?.data));
    }
  };

  return {
    getForecastData,
    getMarineData,
    getOptimalSpeed,
    getRealTimeWeather,
  };
};

export default useVessel;
