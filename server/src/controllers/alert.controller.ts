// controllers/alerts.controller.ts
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { mysqlPool as pool } from "../config/db.js";
import { io } from "../server.js";

// Create a new alert
export const createAlert = async (req: Request, res: Response) => {
  try {
    const {
      voyage_id,
      alert_type,
      message,
      severity,
      category,
      priority = 5,
      recommendations,
      weather_data,
    } = req.body;

    if (!voyage_id || !alert_type || !message || !severity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const id = uuidv4();
    const created_at = new Date();

    const newAlert = {
      id,
      voyage_id,
      alert_type,
      message,
      severity,
      category: category || "general",
      priority,
      recommendations: JSON.stringify(recommendations || []),
      weather_data: JSON.stringify(weather_data || {}),
      created_at,
    };

    await pool.execute(
      `INSERT INTO alerts (id, voyage_id, alert_type, message, severity, category, priority, recommendations, weather_data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newAlert.id,
        newAlert.voyage_id,
        newAlert.alert_type,
        newAlert.message,
        newAlert.severity,
        newAlert.category,
        newAlert.priority,
        newAlert.recommendations,
        newAlert.weather_data,
        newAlert.created_at,
      ]
    );

    // 🔔 Emit only new alerts
    io.emit("alert:new", newAlert);

    return res.status(201).json({
      success: true,
      message: "Alert created successfully",
      data: newAlert,
    });
  } catch (err) {
    console.error("Error creating alert:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get alerts with filters + pagination
export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { voyage_id, severity, resolved, page = 1, limit = 20 } = req.query;

    let sql = `SELECT * FROM alerts WHERE 1=1`;
    const params: any[] = [];

    if (voyage_id) {
      sql += " AND voyage_id = ?";
      params.push(voyage_id);
    }
    if (severity) {
      sql += " AND severity = ?";
      params.push(severity);
    }
    if (resolved !== undefined) {
      sql += " AND resolved = ?";
      params.push(resolved === "true" ? 1 : 0);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const [alerts] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      message: "Alerts fetched successfully",
      data: alerts,
    });
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get single alert by ID
export const getAlertById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows]: any = await pool.query("SELECT * FROM alerts WHERE id = ?", [
      id,
    ]);
    const alert = rows[0];

    if (!alert) {
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Alert fetched successfully",
      data: alert,
    });
  } catch (err) {
    console.error("Error fetching alert:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Acknowledge an alert
export const acknowledgeAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user } = req.body;

    const [result]: any = await pool.execute(
      "UPDATE alerts SET acknowledged = 1, acknowledged_at = ?, acknowledged_by = ? WHERE id = ?",
      [new Date(), user, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });
    }

    const [rows]: any = await pool.query("SELECT * FROM alerts WHERE id = ?", [
      id,
    ]);
    return res
      .status(200)
      .json({ success: true, message: "Alert acknowledged", data: rows[0] });
  } catch (err) {
    console.error("Error acknowledging alert:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Resolve an alert
export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result]: any = await pool.execute(
      "UPDATE alerts SET resolved = 1, resolved_at = ? WHERE id = ?",
      [new Date(), id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });
    }

    const [rows]: any = await pool.query("SELECT * FROM alerts WHERE id = ?", [
      id,
    ]);
    return res
      .status(200)
      .json({ success: true, message: "Alert resolved", data: rows[0] });
  } catch (err) {
    console.error("Error resolving alert:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Stats by severity
export const getAlertStats = async (_: Request, res: Response) => {
  try {
    const [stats]: any = await pool.query(
      "SELECT severity, COUNT(id) as count FROM alerts GROUP BY severity"
    );

    return res
      .status(200)
      .json({ success: true, message: "Alert stats fetched", data: stats });
  } catch (err) {
    console.error("Error fetching alert stats:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
