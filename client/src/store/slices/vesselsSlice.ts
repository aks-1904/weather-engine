import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Vessel {
  id: string;
  name: string;
  imo_number: string;
  captain_id?: string | null;
}

interface VesselsState {
  vessels: Vessel[];
  selected?: Vessel | null;
}

const initialState: VesselsState = {
  vessels: [],
  selected: null,
};

const vesselsSlice = createSlice({
  name: "vessels",
  initialState,
  reducers: {
    setVessels: (state, action: PayloadAction<Vessel[]>) => {
      state.vessels = action.payload;
    },
    addVessel: (state, action: PayloadAction<Vessel>) => {
      state.vessels.push(action.payload);
    },
    updateVessel: (state, action: PayloadAction<Vessel>) => {
      const index = state.vessels.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) state.vessels[index] = action.payload;
    },
    deleteVessel: (state, action: PayloadAction<string>) => {
      state.vessels = state.vessels.filter((v) => v.id !== action.payload);
    },
    setSelectedVessel: (state, action: PayloadAction<Vessel | null>) => {
      state.selected = action.payload;
    },
  },
});

export const {
  setVessels,
  addVessel,
  updateVessel,
  deleteVessel,
  setSelectedVessel,
} = vesselsSlice.actions;
export default vesselsSlice.reducer;
