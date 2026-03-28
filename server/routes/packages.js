import express from 'express';
import { createPackage, getPackage, getPackages, setPackageStatus, updatePackage } from '../controllers/packageController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { packageSchema, statusSchema, validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getPackages);
router.get('/:id', authenticateToken, getPackage);
router.post('/', authenticateToken, requireAdmin, validate(packageSchema), createPackage);
router.put('/:id', authenticateToken, requireAdmin, validate(packageSchema), updatePackage);
router.patch('/:id/status', authenticateToken, requireAdmin, validate(statusSchema), setPackageStatus);

export default router;
