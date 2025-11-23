import { Response } from 'express';
import FavoriteProduct from '../models/FavoriteProduct';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

/**
 * POST /api/favorites/products/:productId
 * Adiciona um produto aos favoritos do usuário
 */
export const addFavoriteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    // Verificar se o produto existe
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }

    // Verificar se já é favorito
    const existingFavorite = await FavoriteProduct.findOne({
      user: userId,
      product: productId,
    });

    if (existingFavorite) {
      res.status(200).json({
        message: 'Produto já está nos favoritos',
        favorite: existingFavorite,
      });
      return;
    }

    // Criar favorito
    const favorite = await FavoriteProduct.create({
      user: userId,
      product: productId,
    });

    res.status(201).json({
      message: 'Produto adicionado aos favoritos',
      favorite,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(200).json({
        message: 'Produto já está nos favoritos',
      });
      return;
    }
    console.error('Error adding favorite product:', error);
    res.status(500).json({ error: error.message || 'Erro ao adicionar favorito' });
  }
};

/**
 * DELETE /api/favorites/products/:productId
 * Remove um produto dos favoritos do usuário
 */
export const removeFavoriteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const favorite = await FavoriteProduct.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!favorite) {
      res.status(404).json({ error: 'Favorito não encontrado' });
      return;
    }

    res.json({
      message: 'Produto removido dos favoritos',
    });
  } catch (error: any) {
    console.error('Error removing favorite product:', error);
    res.status(500).json({ error: error.message || 'Erro ao remover favorito' });
  }
};

/**
 * GET /api/favorites/products
 * Retorna a lista de produtos favoritos do usuário
 */
export const getFavoriteProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const favorites = await FavoriteProduct.find({ user: userId })
      .populate({
        path: 'product',
        populate: {
          path: 'restaurant',
          select: 'name logo',
        },
      })
      .sort({ createdAt: -1 });

    // Extrair apenas os produtos
    const products = favorites
      .map((fav) => fav.product)
      .filter((product: any) => product !== null && product.available !== false);

    res.json({
      favorites: products,
      total: products.length,
    });
  } catch (error: any) {
    console.error('Error getting favorite products:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar favoritos' });
  }
};

/**
 * GET /api/favorites/products/ids
 * Retorna apenas os IDs dos produtos favoritos (mais leve)
 */
export const getFavoriteProductIds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const favorites = await FavoriteProduct.find({ user: userId }).select('product');
    const favoriteIds = favorites.map((fav) => fav.product.toString());

    res.json({
      favoriteIds,
    });
  } catch (error: any) {
    console.error('Error getting favorite product IDs:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar IDs dos favoritos' });
  }
};




