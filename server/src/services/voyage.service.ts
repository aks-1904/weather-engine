import { Voyage, VoyageWithVessel } from "../types/data.js";
import {
  CreateVoyageData,
  UpdateVoyageData,
  VoyageFilters,
} from "../types/credential.js";
import { mysqlPool } from "../config/db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { v4 as uuid } from "uuid";

// Create voyage
export const createVoyage = async (
  voyageData: CreateVoyageData
): Promise<Voyage> => {
  const {
    vessel_id,
    status = "planned",
    origin_port,
    destination_port,
    etd,
    eta,
    route_waypoints,
  } = voyageData;

  const id = uuid();

  const query = `
        INSERT INTO voyages (id, vessel_id, status, origin_port, destination_port, etd, eta, route_waypoints)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

  await mysqlPool.execute<ResultSetHeader>(query, [
    id,
    vessel_id,
    status,
    origin_port,
    destination_port,
    etd,
    eta,
    route_waypoints ? JSON.stringify(route_waypoints) : null,
  ]);

  // Fetch and return the created voyage
  const createdVoyage = await getVoyageById(id);
  return createdVoyage!;
};

export const getAllVoyages = async (
  filters?: VoyageFilters
): Promise<VoyageWithVessel[]> => {
  let query = `
      SELECT 
        v.id, v.vessel_id, v.status, v.origin_port, v.destination_port,
        v.etd, v.eta, v.route_waypoints, v.created_at,
        vs.name as vessel_name, vs.imo_number as vessel_imo_number
      FROM voyages v
      LEFT JOIN vessels vs ON v.vessel_id = vs.id
    `;

  const conditions: string[] = [];
  const params: any[] = [];

  if (filters?.status) {
    conditions.push("v.status = ?");
    params.push(filters.status);
  }

  if (filters?.vessel_id) {
    conditions.push("v.vessel_id = ?");
    params.push(filters.vessel_id);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY v.created_at DESC`;

  const [rows] = await mysqlPool.execute<RowDataPacket[]>(query, params);

  return rows.map((row) => ({
    ...row,
    route_waypoints: row.route_waypoints
      ? JSON.parse(row.route_waypoints as string)
      : null,
  })) as VoyageWithVessel[];
};

// Get voyage by ID
export const getVoyageById = async (id: string) => {
  const query = `
      SELECT 
        v.id, v.vessel_id, v.status, v.origin_port, v.destination_port,
        v.etd, v.eta, v.route_waypoints, v.created_at,
        vs.name as vessel_name, vs.imo_number as vessel_imo_number
      FROM voyages v
      LEFT JOIN vessels vs ON v.vessel_id = vs.id
      WHERE v.id = ?
    `;

  const [rows] = await mysqlPool.execute<RowDataPacket[]>(query, [id]);

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    ...row,
    route_waypoints: row.route_waypoints
      ? JSON.parse(row.route_waypoints)
      : null,
  } as VoyageWithVessel;
};

// Update voyage
export const updateVoyage = async (
  id: string,
  updateData: UpdateVoyageData
): Promise<VoyageWithVessel | null> => {
  // Build dynamic query based on provided fields
  const updateFields: string[] = [];
  const values: any[] = [];

  if (updateData.status !== undefined) {
    updateFields.push("status = ?");
    values.push(updateData.status);
  }

  if (updateData.origin_port !== undefined) {
    updateFields.push("origin_port = ?");
    values.push(updateData.origin_port);
  }

  if (updateData.destination_port !== undefined) {
    updateFields.push("destination_port = ?");
    values.push(updateData.destination_port);
  }

  if (updateData.etd !== undefined) {
    updateFields.push("etd = ?");
    values.push(updateData.etd);
  }

  if (updateData.eta !== undefined) {
    updateFields.push("eta = ?");
    values.push(updateData.eta);
  }

  if (updateData.route_waypoints !== undefined) {
    updateFields.push("route_waypoints = ?");
    values.push(
      updateData.route_waypoints
        ? JSON.stringify(updateData.route_waypoints)
        : null
    );
  }

  if (updateFields.length === 0) {
    // If no fields to update, return existing voyage
    return await getVoyageById(id);
  }

  values.push(id); // Add ID for WHERE clause

  const query = `
  UPDATE voyages
  SET ${updateFields.join(", ")}
  WHERE id = ?
`;

  const [result] = await mysqlPool.execute<ResultSetHeader>(query, values);

  if (result.affectedRows === 0) {
    return null;
  }

  // Return updated voyage
  return await getVoyageById(id);
};

// Delete voyage
export const deleteVoyage = async (id: string): Promise<boolean> => {
  const query = `DELETE FROM voyages WHERE id = ?`;

  const [result] = await mysqlPool.execute<ResultSetHeader>(query, [id]);

  return result.affectedRows > 0;
};

export const getVoyagesByVessel = async (
  vesselId: string,
  status?: string
): Promise<VoyageWithVessel[]> => {
  let query = `
    SELECT 
      v.id, v.vessel_id, v.status, v.origin_port, v.destination_port,
      v.etd, v.eta, v.route_waypoints, v.created_at,
      vs.name as vessel_name, vs.imo_number as vessel_imo_number
    FROM voyages v
    LEFT JOIN vessels vs ON v.vessel_id = vs.id
    WHERE v.vessel_id = ?
  `;

  const params: any[] = [vesselId];

  if (status) {
    query += ` AND v.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY v.created_at DESC`;

  const [rows] = await mysqlPool.execute<RowDataPacket[]>(query, params);

  return rows.map((row) => ({
    ...row,
    route_waypoints: row.route_waypoints
      ? JSON.parse(row.route_waypoints)
      : null,
  })) as VoyageWithVessel[];
};
