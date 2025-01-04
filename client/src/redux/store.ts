import { configureStore } from "@reduxjs/toolkit";
import { authReducer, socketReducer } from "./states";
import { AuthResponse, SocketChange, StatusChange } from "../interfaces";
import { statusReducer } from "./states";

export interface AppStore {
  auth: AuthResponse;
  status: StatusChange;
  socket: SocketChange;
}

export const store = configureStore<AppStore>({
  reducer: {
    auth: authReducer,
    status: statusReducer,
    socket: socketReducer,
  },
});
