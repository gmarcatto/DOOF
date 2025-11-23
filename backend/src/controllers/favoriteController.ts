import { Response } from 'express';
import FavoriteRestaurant, { Favorite } from '../models/Favorite';
import Restaurant from '../models/Restaurant';
import { AuthRequest } from '../middleware/auth';

/**
 * POST /api/favorites/restaurants/:restaurantId
 * Adiciona um restaurante aos favoritos do usuário
 */
export const addFavoriteRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    // Verificar se o restaurante existe
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurante não encontrado' });
      return;
    }

    // Verificar se já é favorito
    const existingFavorite = await FavoriteRestaurant.findOne({
      user: userId,
      restaurant: restaurantId,
    });

    if (existingFavorite) {
      res.status(200).json({
        message: 'Restaurante já está nos favoritos',
        favorite: existingFavorite,
      });
      return;
    }

    // Criar favorito
    const favorite = await FavoriteRestaurant.create({
      user: userId,
      restaurant: restaurantId,
    });

    res.status(201).json({
      message: 'Restaurante adicionado aos favoritos',
      favorite,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(200).json({
        message: 'Restaurante já está nos favoritos',
      });
      return;
    }
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: error.message || 'Erro ao adicionar favorito' });
  }
};

/**
 * DELETE /api/favorites/restaurants/:restaurantId
 * Remove um restaurante dos favoritos do usuário
 */
export const removeFavoriteRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const favorite = await FavoriteRestaurant.findOneAndDelete({
      user: userId,
      restaurant: restaurantId,
    });

    if (!favorite) {
      res.status(404).json({ error: 'Favorito não encontrado' });
      return;
    }

    res.json({
      message: 'Restaurante removido dos favoritos',
    });
  } catch (error: any) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: error.message || 'Erro ao remover favorito' });
  }
};

/**
 * GET /api/favorites/restaurants
 * Retorna a lista de restaurantes favoritos do usuário
 */
export const getFavoriteRestaurants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const favorites = await FavoriteRestaurant.find({ user: userId })
      .populate({
        path: 'restaurant',
        populate: {
          path: 'owner',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    // Extrair apenas os restaurantes
    const restaurants = favorites
      .map((fav) => fav.restaurant)
      .filter((restaurant: any) => restaurant !== null && restaurant.isActive !== false);

    res.json({
      favorites: restaurants,
      total: restaurants.length,
    });
  } catch (error: any) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar favoritos' });
  }
};

/**
 * GET /api/favorites/restaurants/ids
 * Retorna apenas os IDs dos restaurantes favoritos (mais leve)
 */
export const getFavoriteRestaurantIds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const favorites = await FavoriteRestaurant.find({ user: userId }).select('restaurant');
    const favoriteIds = favorites.map((fav) => fav.restaurant.toString());

    res.json({
      favoriteIds,
    });
  } catch (error: any) {
    console.error('Error getting favorite IDs:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar IDs dos favoritos' });
  }
};

