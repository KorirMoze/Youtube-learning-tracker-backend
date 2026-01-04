import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as controller from '../controllers/stats.controller.js';

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
 *             example:
 *               overview:
 *                 totalVideos: 120
 *                 totalWatchTime: 154320
 *                 totalHours: "42.9"
 *                 completedVideos: 80
 *                 averageRating: 4.3
 *                 currentStreak: 7
 *               byCategory:
 *                 - category: Backend
 *                   video_count: 25
 *                   total_time: 45200
 *               byChannel:
 *                 - channel_name: Fireship
 *                   video_count: 15
 *                   total_time: 18000
 *               recentActivity:
 *                 - date: 2025-01-01
 *                   videos_watched: 3
 *                   time_watched: 5400
 *       401:
 *         description: Unauthorized – missing or invalid JWT token
 *       500:
 *         description: Internal server error
 */
router.get('/', controller.getStats);

export default router;
