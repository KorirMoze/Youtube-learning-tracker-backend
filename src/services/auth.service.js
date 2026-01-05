// src/services/auth.service.js
import * as userRepo from '../repositories/user.repository.js';
import { User } from '../domain/models/User.js';
import * as password from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

export async function registerUser(pool, { email, password: rawPassword, name }) {
  const existing = await userRepo.findByEmail(pool, email);

  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await password.hash(rawPassword);

  const row = await userRepo.create(pool, {
    email,
    passwordHash,
    name,
  });

  const user = new User({
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
  });

  const token = signToken({ userId: user.id, email: user.email });

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}

export async function loginUser(pool, { email, password: rawPassword }) {
  const row = await userRepo.findByEmail(pool, email);

  if (!row) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const isValid = await password.compare(rawPassword, row.password_hash);
  if (!isValid) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const user = new User({
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
  });

  const token = signToken({ userId: user.id, email: user.email });

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}
