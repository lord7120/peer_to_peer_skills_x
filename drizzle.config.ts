import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config(); // ✅ Load .env variables

if (
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME
) {
  throw new Error("Missing one or more required DB env variables");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts", // Update if your schema is elsewhere
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: true, // ✅ Required for Render PostgreSQL
  },
});
