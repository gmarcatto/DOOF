import { Router } from 'express';
import { getNearbyRestaurants } from '../controllers/locationController';
import { reverseGeocodeController } from '../controllers/locationController';

const router = Router();

// Public route - não requer autenticação
router.get('/restaurants', getNearbyRestaurants);
router.get('/reverse-geocode', reverseGeocodeController);

export default router;




