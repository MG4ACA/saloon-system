import express from 'express';
import { createService, getService, getServices, setServiceStatus, updateService } from '../controllers/serviceController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { serviceSchema, statusSchema, validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getServices);
router.get('/:id', authenticateToken, getService);
router.post('/', authenticateToken, requireAdmin, validate(serviceSchema), createService);
router.put('/:id', authenticateToken, requireAdmin, validate(serviceSchema), updateService);
router.patch('/:id/status', authenticateToken, requireAdmin, validate(statusSchema), setServiceStatus);

export default router;
