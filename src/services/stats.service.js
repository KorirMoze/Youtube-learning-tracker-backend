export async function getUserStats(pool, userId) {
  // Total stats
  const totalStats = await pool.query(`
    SELECT
      COUNT(*) as total_videos,
      SUM(watch_time) as total_watch_time,
      SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed_videos,
      AVG(rating) as average_rating
    FROM videos
    WHERE user_id = $1
  `, [userId]);

  // Stats by category
  const categoryStats = await pool.query(`
    SELECT
      category,
      COUNT(*) as video_count,
      SUM(watch_time) as total_time
    FROM videos
    WHERE user_id = $1 AND category IS NOT NULL
    GROUP BY category
    ORDER BY total_time DESC
  `, [userId]);

  // Stats by channel
  const channelStats = await pool.query(`
    SELECT
      channel_name,
      COUNT(*) as video_count,
      SUM(watch_time) as total_time
    FROM videos
    WHERE user_id = $1 AND channel_name IS NOT NULL
    GROUP BY channel_name
    ORDER BY video_count DESC
    LIMIT 10
  `, [userId]);

  // Recent activity (last 30 days)
  const recentActivity = await pool.query(`
    SELECT
      DATE(watched_at) as date,
      COUNT(*) as videos_watched,
      SUM(watch_time) as time_watched
    FROM videos
    WHERE user_id = $1
      AND watched_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(watched_at)
    ORDER BY date DESC
  `, [userId]);

  // Learning streak
  const streakResult = await pool.query(`
    WITH daily_activity AS (
      SELECT DISTINCT DATE(watched_at) as activity_date
      FROM videos
      WHERE user_id = $1
      ORDER BY activity_date DESC
    ),
    streak_calc AS (
      SELECT
        activity_date,
        activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date DESC))::int AS streak_group
      FROM daily_activity
    )
    SELECT COUNT(*) as streak_days
    FROM streak_calc
    WHERE streak_group = (
      SELECT streak_group
      FROM streak_calc
      WHERE activity_date = CURRENT_DATE
      LIMIT 1
    )
  `, [userId]);

  return {
    stats: totalStats.rows[0],
    byCategory: categoryStats.rows,
    byChannel: channelStats.rows,
    recentActivity: recentActivity.rows,
    streak: streakResult.rows[0]?.streak_days || 0
  };
}
