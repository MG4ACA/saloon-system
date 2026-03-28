import express from 'express';
import { getEmployeeReport, getSalesReport, getServiceReport } from '../controllers/reportController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All report routes are admin-only
router.use(authenticateToken, requireAdmin);

router.get('/sales',     getSalesReport);
router.get('/employees', getEmployeeReport);
router.get('/services',  getServiceReport);

export default router;
