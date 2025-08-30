import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Alert {
  id: string;
  voyage_id: string;
  alert_type: string;
  message: string;
  severity: string;
  category: string;
  priority: number;
  recommendations?: string[];
  weather_data?: any;
}

interface AlertsState {
  alerts: Alert[];
  stats?: any;
  recent?: Alert[];
  selected?: Alert | null;
}

const initialState: AlertsState = {
  alerts: [],
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.alerts = action.payload;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.push(action.payload);
    },
    setAlertStats: (state, action: PayloadAction<any>) => {
      state.stats = action.payload;
    },
    setRecentAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.recent = action.payload;
    },
    setSelectedAlert: (state, action: PayloadAction<Alert | null>) => {
      state.selected = action.payload;
    },
  },
});

export const {
  setAlerts,
  addAlert,
  setAlertStats,
  setRecentAlerts,
  setSelectedAlert,
} = alertsSlice.actions;
export default alertsSlice.reducer;
