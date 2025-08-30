import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface WeatherState {
  realtime?: any;
  forecast?: any[];
  optimalSpeed?: any;
  marine?: any;
}

const initialState: WeatherState = {};

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setRealtimeWeather: (state, action: PayloadAction<any>) => {
      state.realtime = action.payload;
    },
    setWeatherForecast: (state, action: PayloadAction<any[]>) => {
      state.forecast = action.payload;
    },
    setOptimalSpeed: (state, action: PayloadAction<any>) => {
      state.optimalSpeed = action.payload;
    },
    setMarineWeather: (state, action: PayloadAction<any>) => {
      state.marine = action.payload;
    },
  },
});

export const {
  setRealtimeWeather,
  setWeatherForecast,
  setOptimalSpeed,
  setMarineWeather,
} = weatherSlice.actions;
export default weatherSlice.reducer;
