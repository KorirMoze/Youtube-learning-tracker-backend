import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../../config/database.js';

export async function registerUser({ email, password, name }) {
  const pool = getPool();

  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at`,
    [email, passwordHash, name]
  );

  const user = result.rows[0];

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { user, token };
}

export async function loginUser({ email, password }) {
  const pool = getPool();

  const result = await pool.query(
    'SELECT id, email, name, password_hash FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token
  };
}
