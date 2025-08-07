import { mysqlPool } from "../config/db.js";
import { IUser } from "../types/data.js";
import { hashPassword } from "../utils/auths.js";

export const checkEmailTaken = async (email: string): Promise<boolean> => {
  const [user] = await mysqlPool.execute(
    "SELECT * from users where email = ?",
    [email]
  );

  return Array.isArray(user) && user.length > 0;

};

export const checkUsernameTaken = async (
  username: string
): Promise<boolean> => {
  const [user] = await mysqlPool.execute(
    "SELECT * from users where username = ?",
    [username]
  );

  return Array.isArray(user) && user.length > 0;
;
};

export const createUser = async (userData: IUser) => {
  const { email, password, role, username, id } = userData;

  const hashedPassword = await hashPassword(password); // Password hashing

  // Adding user to database
  await mysqlPool.execute(
    "INSERT INTO users (id, username, role, email, password_hash) VALUES (?, ?, ?, ?, ?)",
    [id, username, role, email, hashedPassword]
  );
};
