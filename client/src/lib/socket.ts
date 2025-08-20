import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/data";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create socket instance (singleton)
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  API_URL,
  {
    autoConnect: false, // Best practice: don't auto connect
    withCredentials: true,
  }
);

// Connect function with auth
export const connectSocket = (token: string) => {
  if (!socket.connected) {
    socket.auth = { token }; // send token for backend auth
    socket.connect();
  }
};

// Disconnect function
export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};
