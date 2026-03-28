import express from 'express';
import { createCustomer, getCustomers, lookupCustomer } from '../controllers/customerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { customerSchema, validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getCustomers);
router.get('/lookup', authenticateToken, lookupCustomer);
router.post('/', authenticateToken, validate(customerSchema), createCustomer);

export default router;
