import { VoyageStatus, Waypoint } from "./data.js";

export interface RegisterCredential {
  username: string;
  email: string;
  password: string;
  role: "captain" | "analyst";
}

export interface CreateVesselData {
  name: string;
  imo_number: number;
  captain_id?: string | null;
}

export interface UpdateVesselData {
  name?: string;
  imo_number?: number;
  captain_id?: string | null;
}

export interface CreateVoyageData {
  vessel_id: string;
  status?: VoyageStatus;
  origin_port: string;
  destination_port: string;
  etd?: Date | null;
  eta?: Date | null;
  route_waypoints?: Waypoint[] | null;
}

export interface UpdateVoyageData {
  status?: VoyageStatus;
  origin_port?: string;
  destination_port?: string;
  etd?: Date | null;
  eta?: Date | null;
  route_waypoints?: Waypoint[] | null;
}

export interface VoyageFilters {
  status?: string;
  vessel_id?: string;
}
