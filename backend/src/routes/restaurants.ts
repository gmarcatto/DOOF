import { Router } from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantPlaceNameController,
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
router.patch('/:id/place-name', authenticate, authorize('restaurant', 'admin'), updateRestaurantPlaceNameController);

export default router;




