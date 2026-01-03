import { getPool } from '../config/database.js';


export async function logVideo(userId, payload) {
  const {
    youtubeId,
    title,
    channelName,
    channelId,
    thumbnailUrl,
    duration,
    watchTime = 0,
    category,
    tags,
    isCompleted = false,
  } = payload;

  const completionPercentage =
    duration && watchTime
      ? Math.min(Math.round((watchTime / duration) * 100), 100)
      : 0;

  const result = await pool.query(
    `
    INSERT INTO videos (
      user_id, youtube_id, title, channel_name, channel_id,
      thumbnail_url, duration, watch_time, completion_percentage,
      is_completed, category, tags
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (user_id, youtube_id)
    DO UPDATE SET
      watch_time = GREATEST(videos.watch_time, EXCLUDED.watch_time),
      completion_percentage = CASE
        WHEN EXCLUDED.duration > 0 THEN
          LEAST(100, ROUND((GREATEST(videos.watch_time, EXCLUDED.watch_time)::float / EXCLUDED.duration) * 100))
        ELSE videos.completion_percentage
      END,
      is_completed = COALESCE(EXCLUDED.is_completed, videos.is_completed),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
    `,
    [
      userId,
      youtubeId,
      title,
      channelName,
      channelId,
      thumbnailUrl,
      duration,
      watchTime,
      completionPercentage,
      isCompleted,
      category,
      tags,
    ]
  );

  return result.rows[0];
}

export async function getVideos(userId, filters) {
  const { limit = 50, offset = 0, category, search } = filters;

  let sql = `SELECT * FROM videos WHERE user_id = $1`;
  const params = [userId];
  let idx = 1;

  if (category) {
    sql += ` AND category = $${++idx}`;
    params.push(category);
  }

  if (search) {
    sql += ` AND (title ILIKE $${++idx} OR channel_name ILIKE $${idx})`;
    params.push(`%${search}%`);
  }

  sql += ` ORDER BY watched_at DESC LIMIT $${++idx} OFFSET $${++idx}`;
  params.push(limit, offset);

  const [videos, count] = await Promise.all([
    pool.query(sql, params),
    pool.query(`SELECT COUNT(*) FROM videos WHERE user_id = $1`, [userId]),
  ]);

  return {
    videos: videos.rows,
    total: parseInt(count.rows[0].count),
    limit,
    offset,
  };
}

export async function getVideoById(userId, id) {
  const result = await pool.query(
    `SELECT * FROM videos WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  return result.rows[0] || null;
}

export async function updateVideo(userId, id, updates) {
  const fields = [];
  const values = [];
  let idx = 0;

  for (const [key, value] of Object.entries(updates)) {
    idx++;
    fields.push(`${key} = $${idx}`);
    values.push(value);
  }

  if (!fields.length) return null;

  values.push(id, userId);

  const result = await pool.query(
    `
    UPDATE videos
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${idx + 1} AND user_id = $${idx + 2}
    RETURNING *
    `,
    values
  );

  return result.rows[0] || null;
}

export async function deleteVideo(userId, id) {
  const result = await pool.query(
    `DELETE FROM videos WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );

  return result.rows.length > 0;
}
