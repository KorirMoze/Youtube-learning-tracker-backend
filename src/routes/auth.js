import express from 'express';
import { body } from 'express-validator';
import * as authController from './auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       $ref: '#/components/requestBodies/RegisterRequest'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/AuthSuccess'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post(
  '/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').optional().trim(),
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       $ref: '#/components/requestBodies/LoginRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AuthSuccess'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  authController.login
);

export default router;
