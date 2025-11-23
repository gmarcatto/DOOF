import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getInvoice,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Order routes
router.get('/', authenticate, getAllOrders);
router.get('/:id/invoice', authenticate, getInvoice); // Deve vir antes de /:id
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, createOrder);
router.put('/:id/status', authenticate, updateOrderStatus);  // Autorização verificada no controller
router.put('/:id/cancel', authenticate, cancelOrder);

export default router;

