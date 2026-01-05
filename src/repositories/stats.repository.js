// src/repositories/stats.repository.js
export async function fetchTotals(pool, userId) {
  const result = await pool.query(
    `
    SELECT
      COUNT(*) AS total_videos,
      COALESCE(SUM(watch_time), 0) AS total_watch_time,
      SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) AS completed_videos,
      AVG(rating) AS average_rating
    FROM videos
    WHERE user_id = $1
    `,
    [userId]
  );

  return result.rows[0];
}

export async function fetchByCategory(pool, userId) {
  const result = await pool.query(
    `
    SELECT
      category,
      COUNT(*) AS video_count,
      SUM(watch_time) AS total_time
    FROM videos
    WHERE user_id = $1 AND category IS NOT NULL
    GROUP BY category
    ORDER BY total_time DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function fetchByChannel(pool, userId) {
  const result = await pool.query(
    `
    SELECT
      channel_name,
      COUNT(*) AS video_count,
      SUM(watch_time) AS total_time
    FROM videos
    WHERE user_id = $1 AND channel_name IS NOT NULL
    GROUP BY channel_name
    ORDER BY video_count DESC
    LIMIT 10
    `,
    [userId]
  );

  return result.rows;
}

export async function fetchRecentActivity(pool, userId) {
  const result = await pool.query(
    `
    SELECT
      DATE(watched_at) AS date,
      COUNT(*) AS videos_watched,
      SUM(watch_time) AS time_watched
    FROM videos
    WHERE user_id = $1
      AND watched_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(watched_at)
    ORDER BY date DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function fetchStreak(pool, userId) {
  const result = await pool.query(
    `
    WITH daily_activity AS (
      SELECT DISTINCT DATE(watched_at) AS activity_date
      FROM videos
      WHERE user_id = $1
    ),
    streak_calc AS (
      SELECT
        activity_date,
        activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date DESC))::int AS streak_group
      FROM daily_activity
    )
    SELECT COUNT(*) AS streak_days
    FROM streak_calc
    WHERE streak_group = (
      SELECT streak_group
      FROM streak_calc
      WHERE activity_date = CURRENT_DATE
      LIMIT 1
    )
    `,
    [userId]
  );

  return result.rows[0]?.streak_days || 0;
}
