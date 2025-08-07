import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Jwt secret not found");
}

export const hashPassword = async (password: string): Promise<string> => {
  const SALT_VALUE = 10;
  const hashedPassword = await bcrypt.hash(password, SALT_VALUE);

  return hashedPassword;
};

export const generateJwtToken = (id: string, role: string): string => {
  const token = jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "10d",
  });

  return token;
};

export const comparePassword = async (
  userPassword: string,
  dbPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(userPassword, dbPassword);
};
