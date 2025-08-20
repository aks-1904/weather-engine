import { mysqlPool } from "../config/db.js";
import {
  AlertCategory,
  AlertData,
  AlertSeverity,
  ForecastData,
  UpdateLocationData,
  WeatherData,
} from "../types/data.js";
import { v4 as uuid } from "uuid";
import { fetchRealTimeWeather } from "./weather.service.js";
import { io } from "../server.js";
import { alertRules } from "../utils/alertRules.js";

const isDemo = process.env.DEMO === "true";

// Alert debouncing to prevent spam
const alertDebounceMap = new Map<string, number>();

const shouldSendAlert = (alertType: string, debounceTime?: number): boolean => {
  if (!debounceTime) return true;

  const lastSent = alertDebounceMap.get(alertType);
  const now = Date.now();

  if (!lastSent || now - lastSent > debounceTime * 60 * 1000) {
    alertDebounceMap.set(alertType, now);
    return true;
  }

  return false;
};

// Save alert to MySQL
const insertAlert = async (
  alertData: AlertData & {
    priority?: number;
    category?: string;
    recommendations?: string[];
    weather_data?: any;
  }
) => {
  try {
    const sql = `
      INSERT INTO alerts (
        id, voyage_id, alert_type, message, severity, priority, 
        category, recommendations, weather_data, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const {
      id,
      voyage_id,
      alert_type,
      message,
      severity,
      priority,
      category,
      recommendations,
      weather_data,
    } = alertData;

    await mysqlPool.execute(sql, [
      id,
      voyage_id,
      alert_type,
      message,
      severity,
      priority || 5,
      category || "general",
      JSON.stringify(recommendations || []),
      JSON.stringify(weather_data || {}),
    ]);
  } catch (error) {
    console.error(`Failed to insert enhanced alert into DB:`, alertData, error);
    throw error;
  }
};

// Push alert to captain via Socket.IO
const pushAlert = (
  captainId: string,
  alert: {
    alertType: string;
    message: string;
    severity: AlertSeverity;
    priority: number;
    category: string;
    recommendations?: string[];
    weatherData?: Partial<WeatherData>;
    timestamp: number;
  }
) => {
  try {
    io.to(captainId).emit("new-alert", alert);
  } catch (error) {
    console.error(
      `Failed to emit enhanced alert to captain ${captainId}:`,
      error
    );
  }
};

export const handleCaptainAlert = async (
  { lat, lon, captainId, voyage_id }: UpdateLocationData,
  forecast?: ForecastData
) => {
  try {
    const weatherResponse = await fetchRealTimeWeather(lat, lon);

    if (!weatherResponse?.data) {
      console.warn(`No weather data received for coordinates [${lat}, ${lon}]`);
      return;
    }

    const weather = weatherResponse.data;
    const triggeredAlerts = alertRules.filter((rule) => {
      try {
        return rule.check(weather, forecast);
      } catch (err) {
        console.error(
          `Error evaluating enhanced alert rule ${rule.type}:`,
          err
        );
        return false;
      }
    });

    // Sort alerts by priority (1 = highest priority)
    triggeredAlerts.sort((a, b) => a.priority - b.priority);

    for (const rule of triggeredAlerts) {
      // Check debouncing
      if (!shouldSendAlert(rule.type, rule.debounceTime)) {
        continue;
      }

      const alertPayload = {
        alertType: rule.type,
        message: rule.message(weather, forecast),
        severity: rule.severity,
        priority: rule.priority,
        category: rule.category,
        recommendations: rule.recommendations,
        weatherData: {
          temperature: weather.temperature,
          windSpeed: weather.windSpeed,
          pressure: weather.pressure,
          visibility: weather.visibility,
          precipitation: weather.precipitation,
        },
        timestamp: Date.now(),
      };

      const id = uuid();

      await insertAlert({
        id,
        voyage_id,
        alert_type: rule.type,
        message: alertPayload.message,
        severity: rule.severity,
        priority: rule.priority,
        category: rule.category,
        recommendations: rule.recommendations,
        weather_data: alertPayload.weatherData,
      });

      pushAlert(captainId, alertPayload);

      // Log critical and emergency alerts
      if (rule.severity === "critical" || rule.severity === "emergency") {
        console.warn(
          `${rule.severity.toUpperCase()} ALERT sent to captain ${captainId}: ${
            alertPayload.message
          }`
        );
      }
    }
  } catch (error) {
    console.error(
      `Error in handleEnhancedCaptainAlert for captain ${captainId}:`,
      error
    );
  }
};

// Enhanced demo alerts
export const sendMockAlerts = async (voyage_id: string, captainId: string) => {
  if (!isDemo) return;

  try {
    console.log("Working");
    const demoAlerts = [
      {
        alertType: "demo_hurricane_warning",
        message:
          "🌀 DEMO: Hurricane force winds approaching - 70 knots expected",
        severity: "emergency" as AlertSeverity,
        priority: 1,
        category: "wind" as AlertCategory,
        recommendations: [
          "Seek immediate shelter",
          "Emergency protocols active",
        ],
      },
      {
        alertType: "demo_dense_fog",
        message: "🌫️ DEMO: Dense fog reducing visibility to 200m",
        severity: "warning" as AlertSeverity,
        priority: 2,
        category: "visibility" as AlertCategory,
        recommendations: ["Reduce speed", "Use fog signals", "Post lookouts"],
      },
      {
        alertType: "demo_cyclone_conditions",
        message: "🌀 DEMO: Cyclone conditions detected - Pressure 975hPa",
        severity: "emergency" as AlertSeverity,
        priority: 1,
        category: "cyclone" as AlertCategory,
        recommendations: [
          "Evacuate area",
          "Contact authorities",
          "Secure vessel",
        ],
      },
      {
        alertType: "demo_favorable_conditions",
        message: "☀️ DEMO: Excellent conditions - Calm seas, good visibility",
        severity: "info" as AlertSeverity,
        priority: 5,
        category: "marine" as AlertCategory,
        recommendations: ["Optimal for operations", "Consider maintenance"],
      },
    ];

    const randomAlert =
      demoAlerts[Math.floor(Math.random() * demoAlerts.length)];
    const id = uuid();

    await insertAlert({
      id,
      voyage_id,
      alert_type: randomAlert.alertType,
      message: randomAlert.message,
      severity: randomAlert.severity,
      priority: randomAlert.priority,
      category: randomAlert.category,
      recommendations: randomAlert.recommendations,
    });

    pushAlert(captainId, {
      ...randomAlert,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error(
      `Failed to send enhanced mock alert to captain ${captainId}:`,
      error
    );
  }
};

// Get active alerts for a voyage
export const getRecentAlerts = async (voyage_id: string) => {
  try {
    const sql = `
      SELECT * FROM alerts 
      WHERE voyage_id = ? 
        AND created_at > DATE_SUB(NOW(), INTERVAL 10 DAY)
      ORDER BY priority ASC, created_at DESC
    `;

    const [rows] = await mysqlPool.execute(sql, [voyage_id]);
    return rows;
  } catch (error) {
    console.error(
      `Error fetching recent alerts (last 10 days) for voyage ${voyage_id}:`,
      error
    );
    return [];
  }
};
