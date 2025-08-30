import axios from "axios";
import {
  setLoading,
  setUser,
  logout as logoutUser,
  setError,
} from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "./app";
import { useNavigate } from "react-router-dom";

const AUTH_API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

// Define a standard response type for auth functions
type AuthResponse = {
  success: boolean;
  message?: string;
};

const useAuth = () => {
  // You might want to get the error state from the store as well
  const { loading, error } = useAppSelector((store) => store.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const register = async ({
    username,
    email,
    password,
    confirmPassword,
  }: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse> => {
    if (!username || !password || !email || !confirmPassword) {
      return { success: false, message: "All details are required" };
    }
    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match" };
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null)); // Clear previous errors

      const res = await axios.post(
        `${AUTH_API_URL}/register`,
        {
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data?.success) {
        localStorage.setItem("token", res.data.token);
        dispatch(setUser(res.data.user));
        navigate("/dashboard/captain", { replace: true });
        return { success: true };
      } else {
        const message = res.data?.message || "Registration failed. Please try again.";
        dispatch(setError(message));
        return { success: false, message };
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "An unexpected error occurred.";
      console.error("Registration Error:", err);
      dispatch(setError(message));
      return { success: false, message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const login = async ({
    emailOrUsername,
    password,
  }: {
    emailOrUsername: string;
    password: string;
  }): Promise<AuthResponse> => {
    if (!emailOrUsername || !password) {
      return { success: false, message: "All details are required" };
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null)); // Clear previous errors

      const res = await axios.post(
        `${AUTH_API_URL}/login`,
        {
          emailOrUsername: emailOrUsername.trim(),
          password: password.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data?.success) {
        localStorage.setItem("token", res.data.token);
        dispatch(setUser(res.data.user));
        navigate(`/dashboard/${res.data.user.role}`, { replace: true });
        return { success: true };
      } else {
        const message = res.data?.message || "Invalid credentials. Please try again.";
        dispatch(setError(message));
        return { success: false, message };
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "An unexpected error occurred.";
      console.error("Login Error:", err);
      dispatch(setError(message));
      return { success: false, message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    dispatch(logoutUser());
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return { logout, register, login, loading, error };
};

export default useAuth;