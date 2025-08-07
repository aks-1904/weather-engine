import { mysqlPool } from "../config/db.js";
import { CreateVesselData, UpdateVesselData } from "../types/credential.js";
import { Vessel } from "../types/data.js";
import { v4 as uuid } from "uuid";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// Create vessel in db
export const createVessel = async (
  vesselData: CreateVesselData
): Promise<Vessel> => {
  const { name, imo_number, captain_id } = vesselData;
  const id = uuid(); // Generating random id for vessel

  const query = ` INSERT INTO vessels (id, name, imo_number, captain_id) VALUES (?, ?, ?, ?)`;
  await mysqlPool.execute<ResultSetHeader>(query, [
    id,
    name,
    imo_number,
    captain_id,
  ]);

  // Fetch and return created vessel
  const createdVessel = await getVesselById(id);
  return createdVessel!;
};

// Get vessel by ID
export const getVesselById = async (id: string): Promise<Vessel | null> => {
  const query = `SELECT id, name, imo_number, captain_id, created_at FROM vessels WHERE id = ?`;
  const [rows] = await mysqlPool.execute<RowDataPacket[]>(query, [id]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as Vessel;
};

// Get all vessels
export const getAllVessels = async (): Promise<Vessel[]> => {
  const query = `
      SELECT id, name, imo_number, captain_id, created_at
      FROM vessels
      ORDER BY created_at DESC
    `;

  const [rows] = await mysqlPool.execute<RowDataPacket[]>(query);
  return rows as Vessel[];
};

// Update vessel
export const updateVessel = async (
  id: string,
  updateData: UpdateVesselData
): Promise<Vessel | null> => {
  // Build dynamic query based on provided fields
  const updateFields: string[] = [];
  const values: any[] = [];

  if (updateData.name !== undefined) {
    updateFields.push("name = ?");
    values.push(updateData.name);
  }

  if (updateData.imo_number !== undefined) {
    updateFields.push("imo_number = ?");
    values.push(updateData.imo_number);
  }

  if (updateData.captain_id !== undefined) {
    updateFields.push("captain_id = ?");
    values.push(updateData.captain_id);
  }

  if (updateFields.length === 0) {
    // If no fields to update, return existing vessel
    return await getVesselById(id);
  }

  values.push(id); // Add ID for WHERE clause

  const query = `
      UPDATE vessels
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

  const [result] = await mysqlPool.execute<ResultSetHeader>(query, values);

  if (result.affectedRows === 0) {
    return null;
  }

  // Return updated vessel
  return await getVesselById(id);
};
