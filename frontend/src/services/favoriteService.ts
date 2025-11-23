import axios from 'axios';

export interface FavoriteRestaurant {
  _id: string;
  restaurant: any;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteProduct {
  _id: string;
  product: any;
  createdAt: string;
  updatedAt: string;
}

export const favoriteService = {
  // ========== FAVORITOS DE RESTAURANTES ==========
  
  // Adicionar restaurante aos favoritos
  addFavoriteRestaurant: async (restaurantId: string): Promise<FavoriteRestaurant> => {
    const response = await axios.post(`/api/favorites/restaurants/${restaurantId}`);
    return response.data.favorite;
  },

  // Remover restaurante dos favoritos
  removeFavoriteRestaurant: async (restaurantId: string): Promise<void> => {
    await axios.delete(`/api/favorites/restaurants/${restaurantId}`);
  },

  // Obter lista de restaurantes favoritos (com dados completos)
  getFavoriteRestaurants: async (): Promise<any[]> => {
    const response = await axios.get('/api/favorites/restaurants');
    return response.data.favorites;
  },

  // Obter apenas IDs dos restaurantes favoritos (mais leve, para verificação rápida)
  getFavoriteRestaurantIds: async (): Promise<string[]> => {
    const response = await axios.get('/api/favorites/restaurants/ids');
    return response.data.favoriteIds;
  },

  // ========== FAVORITOS DE PRODUTOS ==========
  
  // Adicionar produto aos favoritos
  addFavoriteProduct: async (productId: string): Promise<FavoriteProduct> => {
    const response = await axios.post(`/api/favorites/produtos/${productId}`);
    return response.data.favorite;
  },

  // Remover produto dos favoritos
  removeFavoriteProduct: async (productId: string): Promise<void> => {
    await axios.delete(`/api/favorites/produtos/${productId}`);
  },

  // Obter lista de produtos favoritos (com dados completos)
  getFavoriteProducts: async (): Promise<any[]> => {
    const response = await axios.get('/api/favorites/produtos');
    return response.data.favorites;
  },

  // Obter apenas IDs dos produtos favoritos (mais leve, para verificação rápida)
  getFavoriteProductIds: async (): Promise<string[]> => {
    const response = await axios.get('/api/favorites/produtos/ids');
    return response.data.favoriteIds;
  },

  // ========== MÉTODOS DE COMPATIBILIDADE (DEPRECATED) ==========
  // Mantidos para compatibilidade, mas devem ser migrados
  
  addFavorite: async (restaurantId: string): Promise<FavoriteRestaurant> => {
    return favoriteService.addFavoriteRestaurant(restaurantId);
  },

  removeFavorite: async (restaurantId: string): Promise<void> => {
    return favoriteService.removeFavoriteRestaurant(restaurantId);
  },

  getFavorites: async (): Promise<any[]> => {
    return favoriteService.getFavoriteRestaurants();
  },

  getFavoriteIds: async (): Promise<string[]> => {
    return favoriteService.getFavoriteRestaurantIds();
  },
};

