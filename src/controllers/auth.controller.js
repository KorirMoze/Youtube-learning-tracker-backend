// src/controllers/auth.controller.js
import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.pool, req.body);

    res.status(201).json({
      message: 'User created successfully',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.pool, req.body);

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}
