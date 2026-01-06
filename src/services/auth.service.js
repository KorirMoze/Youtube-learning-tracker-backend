// src/services/auth.command.service.js
import bcrypt from 'bcryptjs';
import * as users from '../repositories/user.repository.js';
import { generateToken } from '../utils/jwt.js';

export async function register({ pool, email, password, name }) {
  const existing = await users.findByEmail(pool, email);
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await users.createUser(pool, {
    email,
    name,
    passwordHash,
    provider: 'local',
    providerId: null,
    avatarUrl: null,
  });

  return {
    user,
    token: generateToken(user),
  };
}

export async function login({ pool, email, password }) {
  const user = await users.findByEmail(pool, email);

  if (!user || user.provider !== 'local') {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  return {
    user,
    token: generateToken(user),
  };
}
