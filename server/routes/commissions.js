import express from 'express';
import { getCommissions, getMySummary } from '../controllers/commissionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// /summary must be before / to avoid route collision
router.get('/summary', authenticateToken, getMySummary);
router.get('/', authenticateToken, getCommissions);

export default router;
