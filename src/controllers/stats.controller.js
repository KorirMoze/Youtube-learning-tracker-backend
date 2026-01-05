// src/controllers/stats.controller.js
import * as statsQuery from '../services/stats.service.js';

export async function getStats(req, res, next) {
  try {
    const stats = await statsQuery.getUserStats(
      req.pool,
      req.user.userId
    );

    res.json(stats);
  } catch (err) {
    next(err);
  }
}
