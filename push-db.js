// Simple script to execute SQL directly to create tables
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

async function main() {
  console.log('Creating database tables from schema...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString });
  
  try {
    // SQL statements to create tables
    const createTablesSQL = `
    -- Drop tables if they exist (in reverse order to avoid constraint issues)
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS exchanges CASCADE;
    DROP TABLE IF EXISTS messages CASCADE;
    DROP TABLE IF EXISTS skills CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    
    -- Create users table
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      bio TEXT,
      profile_image TEXT,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- Create skills table
    CREATE TABLE skills (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT[] NOT NULL,
      type VARCHAR(20) NOT NULL,
      proficiency_level VARCHAR(20),
      time_availability TEXT,
      media TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- Create messages table
    CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER NOT NULL REFERENCES users(id),
      receiver_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- Create exchanges table
    CREATE TABLE exchanges (
      id SERIAL PRIMARY KEY,
      requester_id INTEGER NOT NULL REFERENCES users(id),
      provider_id INTEGER NOT NULL REFERENCES users(id),
      requester_skill_id INTEGER REFERENCES skills(id),
      provider_skill_id INTEGER REFERENCES skills(id),
      status VARCHAR(20) NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      next_session TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- Create reviews table
    CREATE TABLE reviews (
      id SERIAL PRIMARY KEY,
      exchange_id INTEGER NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
      reviewer_id INTEGER NOT NULL REFERENCES users(id),
      receiver_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    `;
    
    // Execute SQL
    await pool.query(createTablesSQL);
    console.log('Database tables created successfully!');
    
  } catch (error) {
    console.error('Error creating database tables:', error);
  } finally {
    await pool.end();
  }
}

main();