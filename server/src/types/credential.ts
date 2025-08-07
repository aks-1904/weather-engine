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
