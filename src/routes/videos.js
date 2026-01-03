import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as controller from '../controllers/videos.controller.js';

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Log or update watched video
 *     tags: [Videos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             youtubeId: dQw4w9WgXcQ
 *             title: Node.js Full Course
 *             channelName: Traversy Media
 *             duration: 3600
 *             watchTime: 1200
 *             category: Backend
 *             tags: [nodejs, backend]
 *     responses:
 *       201:
 *         description: Video logged
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 completion_percentage: 33
 */
router.post('/', controller.createVideo);

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: List user videos
 *     tags: [Videos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: offset
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Video list
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               total: 120
 *               videos: []
 */
router.get('/', controller.listVideos);

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Get video by ID
 *     tags: [Videos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Video found
 */
router.get('/:id', controller.getVideo);

/**
 * @swagger
 * /api/videos/{id}:
 *   patch:
 *     summary: Update video
 *     tags: [Videos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             rating: 5
 *             notes: Excellent tutorial
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:id', controller.updateVideo);

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete video
 *     tags: [Videos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:id', controller.removeVideo);

export default router;
