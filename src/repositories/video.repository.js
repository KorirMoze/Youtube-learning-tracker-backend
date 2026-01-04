import { getPool } from '../config/database.js';


export async function upsert(video) {
      const pool = getPool();

  const { rows } = await pool.query(
    `
    INSERT INTO videos (
      user_id, youtube_id, title, channel_name, channel_id,
      thumbnail_url, duration, watch_time,
      completion_percentage, is_completed, category, tags
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (user_id, youtube_id)
    DO UPDATE SET
      watch_time = GREATEST(videos.watch_time, EXCLUDED.watch_time),
      completion_percentage = EXCLUDED.completion_percentage,
      is_completed = EXCLUDED.is_completed,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
    `,
    [
      video.userId,
      video.youtubeId,
      video.title,
      video.channelName,
      video.channelId,
      video.thumbnailUrl,
      video.duration,
      video.watchTime,
      video.completionPercentage(),
      video.isCompleted,
      video.category,
      video.tags,
    ]
  );

  return rows[0];
}

export async function findAll(userId, { limit, offset, category, search }) {
      const pool = getPool();
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
    total: Number(count.rows[0].count),
  };
}

export async function findById(userId, id) {
      const pool = getPool();
  const { rows } = await pool.query(
    `SELECT * FROM videos WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rows[0] || null;
}

export async function update(userId, id, fields) {
      const pool = getPool();
  const keys = Object.keys(fields);
  if (!keys.length) return null;

  const assignments = keys.map(
    (k, i) => `${k} = $${i + 1}`
  );

  const values = Object.values(fields);

  const { rows } = await pool.query(
    `
    UPDATE videos
    SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2}
    RETURNING *
    `,
    [...values, id, userId]
  );

  return rows[0] || null;
}

export async function remove(userId, id) {
      const pool = getPool();
  const { rowCount } = await pool.query(
    `DELETE FROM videos WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rowCount > 0;
}
