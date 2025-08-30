import axios from "axios";
import {
  setLoading,
  setError,
  setVoyages,
  addVoyage,
  deleteVoyage,
} from "../store/slices/voyagesSlice";
import { useAppDispatch, useAppSelector } from "./app";

const VOYAGE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/voyage`;

type ApiResponse = {
  success: boolean;
  message?: string;
};

const useVoyage = () => {
  const { loading, error, voyages, selected } = useAppSelector(
    (state) => state.voyage
  );
  const dispatch = useAppDispatch();

  const fetchAll = async (): Promise<ApiResponse> => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get(`${VOYAGE_API_URL}`);
      if (res.data?.success) {
        dispatch(setVoyages(res.data.voyages));
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch voyages.";
      dispatch(setError(message));
      return { success: false, message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const create = async (data: any): Promise<ApiResponse> => {
    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${VOYAGE_API_URL}`, data);
      if (res.data?.success) {
        dispatch(addVoyage(res.data?.voyage));
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create voyage.";
      dispatch(setError(message));
      return { success: false, message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const update = async (id: string, data: any): Promise<ApiResponse> => {
    try {
      dispatch(setLoading(true));
      const res = await axios.patch(`${VOYAGE_API_URL}/${id}`, data);
      if (res.data?.success) {
        dispatch(fetchAll() as any);
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update voyage.";
      dispatch(setError(message));
      return { success: false, message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const remove = async (id: string): Promise<ApiResponse> => {
    try {
      dispatch(setLoading(true));
      const res = await axios.delete(`${VOYAGE_API_URL}/${id}`);
      if (res.data?.success) {
        dispatch(deleteVoyage(id));
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to delete voyage.";
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
    voyages,
    selected,
  };
};

export default useVoyage;
