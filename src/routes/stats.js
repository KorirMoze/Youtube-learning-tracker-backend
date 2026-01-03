import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get user learning statistics
 *     description: Returns aggregated learning statistics for the authenticated user.
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalVideos:
 *                       type: integer
 *                       example: 120
 *                     totalWatchTime:
 *                       type: integer
 *                       example: 154320
 *                     totalHours:
 *                       type: string
 *                       example: "42.9"
 *                     completedVideos:
 *                       type: integer
 *                       example: 80
 *                     averageRating:
 *                       type: number
 *                       nullable: true
 *                       example: 4.3
 *                     currentStreak:
 *                       type: integer
 *                       example: 7
 *                 byCategory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: Backend
 *                       video_count:
 *                         type: integer
 *                         example: 25
 *                       total_time:
 *                         type: integer
 *                         example: 45200
 *                 byChannel:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       channel_name:
 *                         type: string
 *                         example: Fireship
 *                       video_count:
 *                         type: integer
 *                         example: 15
 *                       total_time:
 *                         type: integer
 *                         example: 18000
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: 2025-01-01
 *                       videos_watched:
 *                         type: integer
 *                         example: 3
 *                       time_watched:
 *                         type: integer
 *                         example: 5400
 *       401:
 *         description: Unauthorized – missing or invalid JWT token
 *       500:
 *         description: Internal server error
 */
// Get user statistics
router.get('/', async (req, res, next) => {
  try {
const pool = req.pool;
    const userId = req.user.userId;

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
      WHERE user_id = $1 AND watched_at >= CURRENT_DATE - INTERVAL '30 days'
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
        SELECT streak_group FROM streak_calc
        WHERE activity_date = CURRENT_DATE
        LIMIT 1
      )
    `, [userId]);

    const stats = totalStats.rows[0];
    const streak = streakResult.rows[0]?.streak_days || 0;

    res.json({
      overview: {
        totalVideos: parseInt(stats.total_videos),
        totalWatchTime: parseInt(stats.total_watch_time) || 0,
        totalHours: ((parseInt(stats.total_watch_time) || 0) / 3600).toFixed(1),
        completedVideos: parseInt(stats.completed_videos),
        averageRating: parseFloat(stats.average_rating) || null,
        currentStreak: parseInt(streak)
      },
      byCategory: categoryStats.rows,
      byChannel: channelStats.rows,
      recentActivity: recentActivity.rows
    });
  } catch (err) {
    next(err);
  }
});

export default router;