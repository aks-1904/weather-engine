import { User } from "./data.js";

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User; // Password not included
  token?: string;
}
