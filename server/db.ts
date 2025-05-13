// db.ts

import pkg from 'pg';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'skill_x',
  password: process.env.DB_PASSWORD || 'your_password',
  port: Number(process.env.DB_PORT) || 5197,
});

export const db = drizzle(pool);
export { pool };
