import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Waypoint {
  lat: number;
  lon: number;
}

interface Voyage {
  id: string;
  vessel_id: string;
  etd: Date;
  eta: Date;
  status: string;
  route_waypoints: Waypoint[];
  vessel_name: string;
  vessel_imo_number: number
}

interface VoyagesState {
  voyages: Voyage[];
  selected?: Voyage | null;
  error: any;
  loading: any;
}

const initialState: VoyagesState = {
  voyages: [],
  selected: null,
  error: null,
  loading: false,
};

const voyagesSlice = createSlice({
  name: "voyages",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<any>) => {
      state.error = action.payload;
    },
    setVoyages: (state, action: PayloadAction<Voyage[]>) => {
      state.voyages = action.payload;
    },
    addVoyage: (state, action: PayloadAction<Voyage>) => {
      state.voyages.push(action.payload);
    },
    updateVoyage: (state, action: PayloadAction<Voyage>) => {
      const index = state.voyages.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) state.voyages[index] = action.payload;
    },
    deleteVoyage: (state, action: PayloadAction<string>) => {
      state.voyages = state.voyages.filter((v) => v.id !== action.payload);
    },
    setSelectedVoyage: (state, action: PayloadAction<Voyage | null>) => {
      state.selected = action.payload;
    },
  },
});

export const {
  setVoyages,
  addVoyage,
  updateVoyage,
  deleteVoyage,
  setSelectedVoyage,
  setError,
  setLoading,
} = voyagesSlice.actions;
export default voyagesSlice.reducer;
