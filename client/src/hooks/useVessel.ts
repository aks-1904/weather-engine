import axios from "axios";
import {
  setLoading,
  setError,
  setVessels,
  deleteVessel,
  addVessel,
  updateVessel,
} from "../store/slices/vesselsSlice";
import { useAppDispatch, useAppSelector } from "./app";

const VESSEL_API_URL = `${import.meta.env.VITE_API_BASE_URL}/vessel`;

type ApiResponse = {
  success: boolean;
  message?: string;
};

const useVessel = () => {
  const { loading, error, vessels, selected } = useAppSelector(
    (state) => state.vessel
  );
  const dispatch = useAppDispatch();

  const fetchAll = async (): Promise<ApiResponse> => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get(`${VESSEL_API_URL}`);
      if (res.data?.success) {
        dispatch(setVessels(res.data.vessels));
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch vessels.";
      dispatch(setError(message));
      return { success: false, message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const create = async (data: {
    name: string;
    imo_number: string;
    captain_id?: string;
  }): Promise<ApiResponse> => {
    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${VESSEL_API_URL}`, data);
      if (res.data?.success) {
        dispatch(addVessel(res.data?.vessel));
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create vessel.";
      dispatch(setError(message));
      return { success: false, message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const update = async (
    id: string,
    data: Partial<{ name: string; captain_id: string }>
  ): Promise<ApiResponse> => {
    try {
      dispatch(setLoading(true));
      const res = await axios.patch(`${VESSEL_API_URL}/${id}`, data);
      if (res.data?.success) {
        dispatch(updateVessel(res.data?.vessel));
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update vessel.";
      dispatch(setError(message));
      return { success: false, message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const remove = async (id: string): Promise<ApiResponse> => {
    try {
      dispatch(setLoading(true));
      const res = await axios.delete(`${VESSEL_API_URL}/${id}`);
      if (res.data?.success) {
        dispatch(deleteVessel(id));
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to delete vessel.";
      dispatch(setError(message));
      return { success: false, message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    fetchAll,
    create,
    update,
    remove,
    loading,
    error,
    vessels,
    selected,
  };
};

export default useVessel;
