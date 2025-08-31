import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AlertsState {
  alerts: any[];
  stats?: any;
  recent?: any[];
  selected?: any | null;
}

const initialState: AlertsState = {
  alerts: [],
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<any[]>) => {
      state.alerts = action.payload;
    },
    addAlert: (state, action: PayloadAction<any>) => {
      state.alerts.push(action.payload);
    },
    setAlertStats: (state, action: PayloadAction<any>) => {
      state.stats = action.payload;
    },
    setRecentAlerts: (state, action: PayloadAction<any[]>) => {
      state.recent = action.payload;
    },
    setSelectedAlert: (state, action: PayloadAction<any | null>) => {
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
