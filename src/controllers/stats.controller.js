import * as statsService from '../services/stats.service.js';

export async function getStats(req, res, next) {
  try {
    const pool = req.pool;
    const userId = req.user.userId;

    const {
      stats,
      byCategory,
      byChannel,
      recentActivity,
      streak
    } = await statsService.getUserStats(pool, userId);

    res.status(200).json({
      overview: {
        totalVideos: parseInt(stats.total_videos),
        totalWatchTime: parseInt(stats.total_watch_time) || 0,
        totalHours: (
          (parseInt(stats.total_watch_time) || 0) / 3600
        ).toFixed(1),
        completedVideos: parseInt(stats.completed_videos),
        averageRating: stats.average_rating
          ? parseFloat(stats.average_rating)
          : null,
        currentStreak: parseInt(streak)
      },
      byCategory,
      byChannel,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
}
