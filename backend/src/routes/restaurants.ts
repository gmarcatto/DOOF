import { Router } from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../controllers/restaurantController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes
router.post('/', authenticate, authorize('restaurant', 'admin'), createRestaurant);
router.put('/:id', authenticate, authorize('restaurant', 'admin'), updateRestaurant);
router.delete('/:id', authenticate, authorize('restaurant', 'admin'), deleteRestaurant);

export default router;




