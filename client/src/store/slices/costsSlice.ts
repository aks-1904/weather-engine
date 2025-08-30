import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface VoyageCost {
  voyageId: string;
  totalCost?: number;
  analysis?: any;
}

interface CostsState {
  costs: VoyageCost[];
}

const initialState: CostsState = {
  costs: [],
};

const costsSlice = createSlice({
  name: "costs",
  initialState,
  reducers: {
    setVoyageCost: (state, action: PayloadAction<VoyageCost>) => {
      const index = state.costs.findIndex(
        (c) => c.voyageId === action.payload.voyageId
      );
      if (index !== -1) {
        state.costs[index] = action.payload;
      } else {
        state.costs.push(action.payload);
      }
    },
  },
});

export const { setVoyageCost } = costsSlice.actions;
export default costsSlice.reducer;
