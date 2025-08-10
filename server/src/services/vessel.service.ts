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

// Delete vessel (decommission)
export const deleteVessel = async (id: string): Promise<boolean> => {
  const query = `DELETE FROM vessels WHERE id = ?`;

  const [result] = await mysqlPool.execute<ResultSetHeader>(query, [id]);

  return result.affectedRows > 0;
};

export const assignCaptain = async (
  vesselId: string,
  captainId: string
): Promise<{ success: boolean; message: string; vessel?: Vessel | null }> => {
  // 1. Check if the user exists and is a captain
  const [users] = await mysqlPool.execute<RowDataPacket[]>(
    `SELECT id, role FROM users WHERE id = ? LIMIT 1`,
    [captainId]
  );

  if (users.length === 0) {
    return { success: false, message: "Captain not found" };
  }

  if (users[0].role.toLowerCase() !== "captain") {
    return { success: false, message: "User is not a captain" };
  }

  // 2. Check if the captain is already assigned to another vessel
  const [existingAssignment] = await mysqlPool.execute<RowDataPacket[]>(
    `SELECT id, name FROM vessels WHERE captain_id = ? AND id != ? LIMIT 1`,
    [captainId, vesselId]
  );

  if (existingAssignment.length > 0) {
    return {
      success: false,
      message: `Captain is already assigned to vessel: ${existingAssignment[0].name}`,
    };
  }

  // 3. Assign the captain to the vessel
  const [result] = await mysqlPool.execute<ResultSetHeader>(
    `UPDATE vessels SET captain_id = ? WHERE id = ?`,
    [captainId, vesselId]
  );

  if (result.affectedRows === 0) {
    return { success: false, message: "Vessel not found" };
  }

  // 4. Return the updated vessel
  const vessel = await getVesselById(vesselId);
  return {
    success: true,
    message: "Captain assigned successfully",
    vessel: vessel ? vessel : null,
  };
};
