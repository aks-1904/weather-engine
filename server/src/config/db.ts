import mysql from "mysql2/promise";
import "dotenv/config";

// Create a connection pool
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to verify the connection
export const connectMySQL = async () => {
  try {
    const connection = await mysqlPool.getConnection();
    console.log("MySQL connected successfully.");
    connection.release(); // Return the connection to the pool
  } catch (error) {
    console.error("MySQL connection error:", error);
    process.exit(1);
  }
};
