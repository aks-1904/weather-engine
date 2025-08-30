import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface CostsState {
  costs: any;
  analysis: any;
}

const initialState: CostsState = {
  costs: null,
  analysis: null,
};

const costsSlice = createSlice({
  name: "costs",
  initialState,
  reducers: {
    setVoyageCost: (state, action: PayloadAction<any>) => {
      state.costs = action.payload;
    },
    setVoyageAnalysis: (state, action: PayloadAction<any>) => {
      state.analysis = action.payload;
    },
  },
});

export const { setVoyageCost, setVoyageAnalysis } = costsSlice.actions;
export default costsSlice.reducer;
