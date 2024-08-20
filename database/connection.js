// establish connection with database
import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // add this one for production
  ssl: process.env.DB_SSL === "true",
});

// pool is a passport to send requests to database

export async function checkConnection() {
  try {
    //  resolved promise
    const client = await pool.connect();
    console.log("Connected to database", client.database);
  } catch (error) {
    // rejected promise
    console.log("Could not connect to database", error);
  }
}

export default pool;
