import { getPool } from '../config/database.js';

export function attachPool(req, res, next) {
  req.pool = getPool();
  next();
}