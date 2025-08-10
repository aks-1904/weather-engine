import { mysqlPool } from "../config/db.js";
import {
  AlertData,
  AlertRules,
  UpdateLocationData,
  WeatherData,
} from "../types/data.js";
import { v4 as uuid } from "uuid";
import { fetchRealTimeWeather } from "./weather.service.js";
import { io } from "../server.js";

const isDemo = process.env.DEMO === "true";

// Predefined rules for critical conditions
const alertRules: AlertRules[] = [
  {
    type: "high_wind",
    severity: "critical",
    check: (data: WeatherData) => data.windSpeed > 40,
    message: (data: WeatherData) =>
      `High wind speed detected: ${data.windSpeed} knots`,
  },
  {
    type: "high_waves",
    severity: "critical",
    check: (data: WeatherData) => data.cloudCover > 80 && data.windSpeed > 30,
    message: () => `Severe sea state detected`,
  },
  {
    type: "low_visibility",
    severity: "warning",
    check: (data: WeatherData) => data.visibility < 1000,
    message: (data: WeatherData) => `Low visibility: ${data.visibility} meters`,
  },
  {
    type: "heavy_precipitation",
    severity: "warning",
    check: (data: WeatherData) => data.precipitation > 20,
    message: (data: WeatherData) =>
      `Heavy precipitation: ${data.precipitation} mm/hr`,
  },
];

// Save alert to MySQL
const insertAlert = async (alertData: AlertData) => {
  try {
    const sql = `
      INSERT INTO alerts (id, voyage_id, alert_type, message, severity)
      VALUES (?, ?, ?, ?, ?)
    `;
    const { id, voyage_id, alert_type, message, severity } = alertData;
    await mysqlPool.execute(sql, [
      id,
      voyage_id,
      alert_type,
      message,
      severity,
    ]);
  } catch (error) {
    console.error(`Failed to insert alert into DB:`, alertData, error);
    throw error;
  }
};

// Push alert to captain via Socket.IO
const pushAlert = (
  captainId: string,
  alert: { alertType: string; message: string; severity: string }
) => {
  try {
    io.to(captainId).emit("new-alert", alert);
  } catch (error) {
    console.error(`Failed to emit alert to captain ${captainId}:`, error);
  }
};

export const handleCaptainAlert = async ({
  lat,
  lon,
  captainId,
  voyage_id,
}: UpdateLocationData) => {
  try {
    const weatherResponse = await fetchRealTimeWeather(lat, lon);

    if (!weatherResponse?.data) {
      console.warn(`No weather data received for coordinates [${lat}, ${lon}]`);
      return;
    }

    const weather = weatherResponse.data;
    const triggeredAlerts = alertRules.filter((rule) => {
      try {
        return rule.check(weather);
      } catch (err) {
        console.error(`Error evaluating alert rule ${rule.type}:`, err);
        return false;
      }
    });

    for (const rule of triggeredAlerts) {
      const alertPayload = {
        alertType: rule.type,
        message: rule.message(weather),
        severity: rule.severity,
      };

      const id = uuid();

      await insertAlert({
        id,
        voyage_id,
        alert_type: rule.type,
        message: alertPayload.message,
        severity: rule.severity,
      });

      pushAlert(captainId, alertPayload);
    }
  } catch (error) {
    console.error(
      `Error in handleCaptainAlert for captain ${captainId}:`,
      error
    );
  }
};

export const sendMockAlerts = async (voyage_id: string, captainId: string) => {
  if (!isDemo) return;

  try {
    const demoAlerts = [
      {
        alertType: "demo_high_wind",
        message: "Demo Alert: High winds expected in your area.",
        severity: "warning",
      },
      {
        alertType: "demo_low_visibility",
        message: "Demo Alert: Visibility dropping below safe limits.",
        severity: "warning",
      },
      {
        alertType: "demo_heavy_precipitation",
        message: "Demo Alert: Heavy precipitation detected.",
        severity: "critical",
      },
      {
        alertType: "demo_clear_weather",
        message: "Demo Alert: Clear skies ahead.",
        severity: "info",
      },
      {
        alertType: "demo_high_waves",
        message: "Demo Alert: Large waves detected in your area.",
        severity: "critical",
      },
    ];

    // Pick a random demo alert
    const randomAlert =
      demoAlerts[Math.floor(Math.random() * demoAlerts.length)];

    const id = uuid();

    await insertAlert({
      id,
      voyage_id,
      alert_type: randomAlert.alertType,
      message: randomAlert.message,
      severity: randomAlert.severity as any,
    });

    pushAlert(captainId, randomAlert);
  } catch (error) {
    console.error(`Failed to send mock alert to captain ${captainId}:`, error);
  }
};
