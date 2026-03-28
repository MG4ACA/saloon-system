import express from 'express';
import {
  getAllUsers,
  getUserById,
  getUserStats,
  updateUser,
  updateUserStatus,
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { validate, updateStatusSchema, updateUserSchema } from '../middleware/validateMiddleware.js';

const router = express.Router();

// All routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.put('/:id', validate(updateUserSchema), updateUser);
router.patch('/:id/status', validate(updateStatusSchema), updateUserStatus);

export default router;
