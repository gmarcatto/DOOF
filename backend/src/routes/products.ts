import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/', authenticate, authorize('restaurant', 'admin'), createProduct);
router.put('/:id', authenticate, authorize('restaurant', 'admin'), updateProduct);
router.delete('/:id', authenticate, authorize('restaurant', 'admin'), deleteProduct);

export default router;




