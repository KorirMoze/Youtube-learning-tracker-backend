import { validationResult } from 'express-validator';
import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { user, token } = await authService.registerUser(req.body);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { user, token } = await authService.loginUser(req.body);

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}
