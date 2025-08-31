import axios from "axios";
import { useAppDispatch } from "./app";
import { setVoyageCost, setVoyageAnalysis } from "../store/slices/costsSlice";

const COSTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/cost`;

const useCosts = () => {
  const dispatch = useAppDispatch();

  const getVoyageCosts = async (voyage_id: string, fuelPrice: number) => {
    try {
      const res = await axios.get(
        `${COSTS_API_URL}/${voyage_id}?fuelPrice=${fuelPrice}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (res.data?.data) {
        dispatch(setVoyageCost(res.data?.data));
      }
    } catch (error) {}
  };

  const getVoyageAnalysis = async (voyage_id: string, fuelPrice: number) => {
    try {
      const res = await axios.get(
        `${COSTS_API_URL}/${voyage_id}/analysis?fuelPrice=${fuelPrice}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (res.data?.data) {
        console.log(res.data?.data);
        dispatch(setVoyageAnalysis(res.data?.data));
      }
    } catch (error) {}
  };

  return {
    getVoyageCosts,
    getVoyageAnalysis,
  };
};

export default useCosts;
