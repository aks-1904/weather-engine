import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Waypoint {
  lat: number;
  lng: number;
}

interface Voyage {
  id: string;
  vessel_id: string;
  origin_port: string;
  destination_port: string;
  etd: string;
  eta: string;
  status: string;
  route_waypoints: Waypoint[];
}

interface VoyagesState {
  voyages: Voyage[];
  selected?: Voyage | null;
}

const initialState: VoyagesState = {
  voyages: [],
  selected: null,
};

const voyagesSlice = createSlice({
  name: "voyages",
  initialState,
  reducers: {
    setVoyages: (state, action: PayloadAction<Voyage[]>) => {
      state.voyages = action.payload;
    },
    addVoyage: (state, action: PayloadAction<Voyage>) => {
      state.voyages.push(action.payload);
    },
    updateVoyage: (state, action: PayloadAction<Voyage>) => {
      const index = state.voyages.findIndex(v => v.id === action.payload.id);
      if (index !== -1) state.voyages[index] = action.payload;
    },
    deleteVoyage: (state, action: PayloadAction<string>) => {
      state.voyages = state.voyages.filter(v => v.id !== action.payload);
    },
    setSelectedVoyage: (state, action: PayloadAction<Voyage | null>) => {
      state.selected = action.payload;
    },
  },
});

export const { setVoyages, addVoyage, updateVoyage, deleteVoyage, setSelectedVoyage } =
  voyagesSlice.actions;
export default voyagesSlice.reducer;
