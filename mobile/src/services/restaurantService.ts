import api from '../config/api';

export interface RestaurantAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  placeName?: string;
}

export interface OpeningHours {
  dayOfWeek: number;
  open: string;
  close: string;
  closed: boolean;
}

export interface Restaurant {
  _id?: string;
  name: string;
  description: string;
  category: string[];
  logo?: string;
  banner?: string;
  address: RestaurantAddress;
  phone: string;
  email: string;
  owner?: string;
  openingHours?: OpeningHours[];
  deliveryFee: number;
  minimumOrder: number;
  averageDeliveryTime?: number;
  rating?: number;
  totalReviews?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantListResponse {
  restaurants: Restaurant[];
}

export interface RestaurantResponse {
  restaurant: Restaurant;
}

// Listar todos os restaurantes
export const getAllRestaurants = async (params?: {
  category?: string;
  search?: string;
  isActive?: boolean;
}): Promise<Restaurant[]> => {
  try {
    const response = await api.get<RestaurantListResponse>('/restaurants', { params });
    return response.data.restaurants;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao buscar restaurantes');
  }
};

// Buscar restaurante por ID
export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  try {
    const response = await api.get<RestaurantResponse>(`/restaurants/${id}`);
    return response.data.restaurant;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao buscar restaurante');
  }
};

// Criar restaurante
export const createRestaurant = async (data: Restaurant): Promise<Restaurant> => {
  try {
    const response = await api.post<RestaurantResponse>('/restaurants', data);
    return response.data.restaurant;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao criar restaurante');
  }
};

// Atualizar restaurante
export const updateRestaurant = async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
  try {
    const response = await api.put<RestaurantResponse>(`/restaurants/${id}`, data);
    return response.data.restaurant;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao atualizar restaurante');
  }
};

// Deletar restaurante
export const deleteRestaurant = async (id: string): Promise<void> => {
  try {
    await api.delete(`/restaurants/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao deletar restaurante');
  }
};

