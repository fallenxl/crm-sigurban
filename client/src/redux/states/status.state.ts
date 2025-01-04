import { createSlice } from "@reduxjs/toolkit";

const statusEmptyState = {
  statusChange: false,
};

const StatusSlice = createSlice({
  name: "status",
  initialState: statusEmptyState,
  reducers: {
    setStatusChange(state, action) {
      state.statusChange = action.payload;
     
    },
  },
});

export default StatusSlice.reducer;
export const { setStatusChange } = StatusSlice.actions;
