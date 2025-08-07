export interface RegisterCredential {
  username: string;
  email: string;
  password: string;
  role: "captain" | "analyst";
}
