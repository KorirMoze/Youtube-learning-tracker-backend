import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { getPool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Log a watched video
router.post('/',
  body('youtubeId').notEmpty(),
  body('title').notEmpty(),
  body('channelName').optional(),
  body('duration').optional().isInt(),
  body('watchTime').optional().isInt(),
  body('category').optional(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        youtubeId,
        title,
        channelName,
        channelId,
        thumbnailUrl,
        duration,
        watchTime,
        category,
        tags,
        isCompleted
      } = req.body;

      const completionPercentage = duration && watchTime
        ? Math.min(Math.round((watchTime / duration) * 100), 100)
        : 0;

      const result = await pool.query(`
        INSERT INTO videos (
          user_id, youtube_id, title, channel_name, channel_id,
          thumbnail_url, duration, watch_time, completion_percentage,
          is_completed, category, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      `, [
        req.user.userId,
        youtubeId,
        title,
        channelName,
        channelId,
        thumbnailUrl,
        duration,
        watchTime || 0,
        completionPercentage,
        isCompleted || false,
        category,
        tags
      ]);

      res.status(201).json({
        message: 'Video logged successfully',
        video: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get all videos for user
router.get('/',
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('category').optional(),
  query('search').optional(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const { category, search } = req.query;

      let query = 'SELECT * FROM videos WHERE user_id = $1';
      const params = [req.user.userId];
      let paramCount = 1;

      if (category) {
        paramCount++;
        query += ` AND category = $${paramCount}`;
        params.push(category);
      }

      if (search) {
        paramCount++;
        query += ` AND (title ILIKE $${paramCount} OR channel_name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY watched_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM videos WHERE user_id = $1',
        [req.user.userId]
      );

      res.json({
        videos: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit,
        offset
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get single video
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM videos WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ video: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Update video (notes, rating, completion status)
router.patch('/:id',
  body('notes').optional(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('isCompleted').optional().isBoolean(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { notes, rating, isCompleted } = req.body;
      const updates = [];
      const params = [];
      let paramCount = 0;

      if (notes !== undefined) {
        paramCount++;
        updates.push(`notes = $${paramCount}`);
        params.push(notes);
      }

      if (rating !== undefined) {
        paramCount++;
        updates.push(`rating = $${paramCount}`);
        params.push(rating);
      }

      if (isCompleted !== undefined) {
        paramCount++;
        updates.push(`is_completed = $${paramCount}`);
        params.push(isCompleted);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(req.params.id, req.user.userId);

      const result = await pool.query(`
        UPDATE videos
        SET ${updates.join(', ')}
        WHERE id = $${paramCount + 1} AND user_id = $${paramCount + 2}
        RETURNING *
      `, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.json({
        message: 'Video updated successfully',
        video: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
);

// Delete video
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM videos WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;