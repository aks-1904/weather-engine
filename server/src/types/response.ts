import { User, Vessel } from "./data.js";

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
