// src/services/stats.query.service.js
import * as repo from '../repositories/stats.repository.js';
import { UserStats } from '../domain/models/Stats.js';

export async function getUserStats(pool, userId) {
  const [
    totals,
    byCategory,
    byChannel,
    recentActivity,
    streak,
  ] = await Promise.all([
    repo.fetchTotals(pool, userId),
    repo.fetchByCategory(pool, userId),
    repo.fetchByChannel(pool, userId),
    repo.fetchRecentActivity(pool, userId),
    repo.fetchStreak(pool, userId),
  ]);

  return new UserStats({
    totals,
    byCategory,
    byChannel,
    recentActivity,
    streak,
  });
}
