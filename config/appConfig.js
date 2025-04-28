require("dotenv").config();

// APP
const BASE_URL =
  process.env.BASE_URL ?? "https://backend-rehatin-v2.vercel.app/";
const PORT = process.env.PORT ?? 8000;

// DATABASE
const DB_HOST = process.env.DATABASE_HOST ?? "sql102.infinityfree.com";
const DB_PORT = process.env.DATABASE_PORT ?? 3306;
const DB_USER = process.env.DATABASE_USER ?? "if0_37218456";
const DB_PASSWORD = process.env.DATABASE_PASSWORD ?? "Maulana94";
const DB_NAME = process.env.DATABASE_NAME ?? "if0_37218456_rehatin_v2";

// SECRET KEYS (Hanya dari .env)
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not defined in .env!");
}

// Validasi variabel lingkungan penting
const requiredEnvVars = { BASE_URL, PORT, DB_HOST, DB_PORT, DB_USER, DB_NAME };
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is not defined in .env!`);
  }
});

module.exports = {
  BASE_URL,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  SECRET,
};
