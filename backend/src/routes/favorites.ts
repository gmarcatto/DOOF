import { Router } from 'express';
import {
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
  getFavoriteRestaurants,
  getFavoriteRestaurantIds,
} from '../controllers/favoriteController';
import {
  addFavoriteProduct,
  removeFavoriteProduct,
  getFavoriteProducts,
  getFavoriteProductIds,
} from '../controllers/favoriteProductController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas de favoritos de RESTAURANTES
router.post('/restaurants/:restaurantId', addFavoriteRestaurant);
router.delete('/restaurants/:restaurantId', removeFavoriteRestaurant);
router.get('/restaurants/ids', getFavoriteRestaurantIds); // Rota leve para obter apenas IDs
router.get('/restaurants', getFavoriteRestaurants); // Rota completa com dados dos restaurantes

// Rotas de favoritos de PRODUTOS
router.post('/produtos/:productId', addFavoriteProduct);
router.delete('/produtos/:productId', removeFavoriteProduct);
router.get('/produtos/ids', getFavoriteProductIds); // Rota leve para obter apenas IDs
router.get('/produtos', getFavoriteProducts); // Rota completa com dados dos produtos

// Rotas de compatibilidade (redirecionam para restaurantes)
// Mantidas para não quebrar código existente, mas devem ser migradas
router.post('/:restaurantId', addFavoriteRestaurant);
router.delete('/:restaurantId', removeFavoriteRestaurant);
router.get('/ids', getFavoriteRestaurantIds);
router.get('/', getFavoriteRestaurants);

export default router;

