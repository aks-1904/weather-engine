import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/data";

const API_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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

export const joinRoom = (userId: string) => {
  if (!userId) return;
  socket.emit("join-room", userId);
};

export const sendRandomLocationUpdate = (
  captainId: string,
  voyageId: string
) => {
  if (!captainId || !voyageId) return;

  // Generate random latitude (-90 to 90) and longitude (-180 to 180)
  const lat = (Math.random() * 180 - 90).toFixed(6);
  const lon = (Math.random() * 360 - 180).toFixed(6);

  socket.emit("update-location", {
    captainId,
    voyage_id: voyageId,
    lat: parseFloat(lat),
    lon: parseFloat(lon),
  });
};

// Disconnect function
export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};
