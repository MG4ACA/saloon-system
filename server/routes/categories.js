import express from 'express';
import { createCategory, getCategories, setCategoryStatus, updateCategory } from '../controllers/categoryController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { categorySchema, statusSchema } from '../middleware/validateMiddleware.js';

const router = express.Router();

// All authenticated users can read categories
router.get('/', authenticateToken, getCategories);

// Admin-only writes
router.post('/', authenticateToken, requireAdmin, validate(categorySchema), createCategory);
router.put('/:id', authenticateToken, requireAdmin, validate(categorySchema), updateCategory);
router.patch('/:id/status', authenticateToken, requireAdmin, validate(statusSchema), setCategoryStatus);

export default router;
