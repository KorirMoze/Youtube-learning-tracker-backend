// src/utils/password.js
import bcrypt from 'bcryptjs';

export const hash = (password) => bcrypt.hash(password, 10);
export const compare = (password, hash) => bcrypt.compare(password, hash);
