import { Server } from "socket.io";
import { UpdateLocationData } from "../types/data.js";
import { generateLocationCacheKey, setCachedData } from "../utils/cache.js";
import {
  handleCaptainAlert,
  sendMockAlerts,
} from "../services/alert.service.js";
import { hasSignificantLocationChangeOrTimChange } from "../utils/location.js";

const LOCATION_EXPIRE = 2 * 60; // 2 minutes in seconds

export const setupSocketIO = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on(
      "demo-notification",
      async ({
        captain_id,
        voyage_id,
      }: {
        captain_id: string;
        voyage_id: string;
      }) => {
        sendMockAlerts(voyage_id, captain_id);
      }
    );

    socket.on("update-location", async (data: UpdateLocationData) => {
      try {
        if (!data?.captainId || !data?.lat || !data?.lon || !data?.voyage_id) {
          console.warn(
            `Invalid location update data from socket ${socket.id}`,
            data
          );
          return;
        }

        const locationChanged = await hasSignificantLocationChangeOrTimChange(
          data.captainId,
          data.lat,
          data.lon,
          0.5, // 0.5 km threshhold
          10 // 10 minutes time threshold
        );
        if (!locationChanged) {
          // No significant change, no need to call api
          return;
        }

        const cacheKey = generateLocationCacheKey(data.captainId);
        await setCachedData(
          cacheKey,
          JSON.stringify({
            lat: data.lat,
            lon: data.lon,
            lastCheck: Date.now(),
          }),
          LOCATION_EXPIRE
        );

        await handleCaptainAlert({
          lat: data.lat,
          lon: data.lon,
          captainId: data.captainId,
          voyage_id: data.voyage_id,
        });
      } catch (error) {
        console.error(
          `Error in update-location handler for socket ${socket.id}:`,
          error
        );
      }
    });

    socket.on("join-room", (userId: string) => {
      if (!userId) {
        console.warn(
          `join-room called without a userId from socket ${socket.id}`
        );
        return;
      }
      socket.join(userId);
      console.log(`User ${userId} joined their private room`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
