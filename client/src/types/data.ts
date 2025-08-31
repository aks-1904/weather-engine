// Define your event types for TypeScript safety
export interface ServerToClientEvents {
  "new-alert": any;
}

export interface ClientToServerEvents {
  "join-room": (roomId: string) => void;
  "update-location": any;
}

export interface SocketState {
  connected: boolean;
  alerts: any[];
  messages: string[];
}
