import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  drones: [],
};

const droneSlice = createSlice({
  name: "drones",
  initialState,
  reducers: {
    setDrones: (state, action) => {
      state.drones = action.payload;
    },
  },
});

export const { setDrones } = droneSlice.actions;
export default droneSlice.reducer;
