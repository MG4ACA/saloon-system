import express from 'express';
import { createTask, getTask, getTasks, getTaskSummary, updateTask, updateTaskStatus } from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { taskSchema, taskStatusSchema, validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Summary must be before /:id or Express will match "summary" as an id
router.get('/summary', authenticateToken, getTaskSummary);

router.get('/', authenticateToken, getTasks);
router.get('/:id', authenticateToken, getTask);
router.post('/', authenticateToken, validate(taskSchema), createTask);
router.patch('/:id', authenticateToken, updateTask);
router.patch('/:id/status', authenticateToken, validate(taskStatusSchema), updateTaskStatus);

export default router;
