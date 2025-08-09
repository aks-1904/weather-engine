import { User, Vessel, Voyage, VoyageWithVessel } from "./data.js";

export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface AuthResponse extends BaseResponse {
  user?: User; // Password not included
  token?: string;
}

export interface VesselResponse extends BaseResponse {
  vessel?: Vessel;
  vessels?: Vessel[];
}

export interface VoyageResponse extends BaseResponse {
  voyage?: Voyage;
  voyages?: VoyageWithVessel[];
}

export interface WeatherResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  source: "cache" | "api";
}

export interface WeatherControllerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    source: "cache" | "api";
    timestamp: number;
    processingTimeMs: number;
  };
}
