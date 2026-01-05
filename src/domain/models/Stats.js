// src/domain/stats.js
export class UserStats {
  constructor({ totals, byCategory, byChannel, recentActivity, streak }) {
    this.overview = {
      totalVideos: Number(totals.total_videos),
      totalWatchTime: Number(totals.total_watch_time),
      totalHours: (Number(totals.total_watch_time) / 3600).toFixed(1),
      completedVideos: Number(totals.completed_videos),
      averageRating: totals.average_rating
        ? Number(totals.average_rating)
        : null,
      currentStreak: Number(streak),
    };

    this.byCategory = byCategory;
    this.byChannel = byChannel;
    this.recentActivity = recentActivity;
  }
}
