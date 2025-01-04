import { createSlice } from "@reduxjs/toolkit";

const statusEmptyState = {
  socket: null,
};

const SocketSlice = createSlice({
  name: "status",
  initialState: statusEmptyState,
  reducers: {
    setSocket(state, action) {
      state.socket = action.payload;
     
    },
  },
});

export default SocketSlice.reducer;
export const { setSocket } = SocketSlice.actions;
