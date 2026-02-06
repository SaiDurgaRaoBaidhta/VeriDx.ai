import pg from 'pg'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.warn('DATABASE_URL not set; admin and expert data will not use PostgreSQL.')
}

export const pool = connectionString ? new Pool({ connectionString }) : null

export async function initDb() {
  if (!pool) return false
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS experts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        cv_filename TEXT,
        cv_content BYTEA,
        cv_summary TEXT,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    return true
  } catch (err) {
    console.error('DB init error:', err.message)
    return false
  }
}

export async function query(text, params) {
  if (!pool) return null
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}
