import express from 'express';
import { login, logout, refresh, register } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate, loginSchema, registerSchema } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);

// Protected routes
router.post('/logout', authenticateToken, logout);

export default router;
