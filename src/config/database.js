import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Initialize database tables
export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        youtube_id VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        channel_name VARCHAR(255),
        channel_id VARCHAR(255),
        thumbnail_url TEXT,
        duration INTEGER, -- in seconds
        watch_time INTEGER DEFAULT 0, -- actual time watched in seconds
        completion_percentage INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT false,
        category VARCHAR(100),
        tags TEXT[], -- array of tags
        notes TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, youtube_id)
      );

      CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
      CREATE INDEX IF NOT EXISTS idx_videos_watched_at ON videos(watched_at);
      CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
    `);
    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

export default pool;