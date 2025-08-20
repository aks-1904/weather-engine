// Define your event types for TypeScript safety
export interface ServerToClientEvents {
  "new-alert": (data: { message: string; voyageId: string }) => void;
  "weather-update": (data: { lat: number; lon: number; forecast: any }) => void;
}

export interface ClientToServerEvents {
  "join-room": (roomId: string) => void;
  "send-message": (msg: string) => void;
}

export interface Alert {
  message: string;
  voyageId: string;
}

export interface SocketState {
  connected: boolean;
  alerts: Alert[];
  messages: string[];
}
