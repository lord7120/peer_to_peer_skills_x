// db.ts

import pkg from 'pg';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool);
export { pool };
