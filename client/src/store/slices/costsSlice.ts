import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Waypoint {
  lat: number;
  lon: number;
}

interface Leg {
  leg: number;
  startWaypoint: Waypoint;
  endWaypoint: Waypoint;
  distanceNm: number;
  vesselBearing: number;
  baseSpeedKnots: number;
  adjustSpeedKnots: number;
  estimatedDurationHours: number;
  weather: {
    windSpeed: number;
    windDirection: number;
    waveHeight: number;
    waveDirection: number;
  };
  fuelConsumptionTones: number;
  fuelCosts: number;
  performanceInsight: string;
}

interface VoyageAnalysis {
  summary: any;
  legs: Leg[];
}

interface CostsState {
  costs: any;
  analysis: VoyageAnalysis | null;
  selectedLeg: Leg | null;
}

const initialState: CostsState = {
  costs: null,
  analysis: null,
  selectedLeg: null,
};

const costsSlice = createSlice({
  name: "costs",
  initialState,
  reducers: {
    setVoyageCost: (state, action: PayloadAction<any>) => {
      state.costs = action.payload;
    },
    setVoyageAnalysis: (state, action: PayloadAction<VoyageAnalysis>) => {
      state.analysis = action.payload;
      state.selectedLeg = null;
    },
    setSelectedLeg: (state, action: PayloadAction<Leg | null>) => {
      state.selectedLeg = action.payload;
    },
  },
});

export const { setVoyageCost, setVoyageAnalysis, setSelectedLeg } =
  costsSlice.actions;
export default costsSlice.reducer;
