import axios from 'axios';

export interface NearbyRestaurant {
  id: string;
  nome: string;
  endereco: string;
  placeName?: string | null;
  latitude: number;
  longitude: number;
  distancia_metros: number;
  // Campos adicionais do restaurante
  description?: string;
  category?: string[];
  logo?: string;
  banner?: string;
  rating?: number;
  totalReviews?: number;
  deliveryFee?: number;
  averageDeliveryTime?: number;
  minimumOrder?: number;
  isActive?: boolean;
}

export interface LocationRestaurantsResponse {
  restaurants: NearbyRestaurant[];
  total: number;
  raio_metros: number;
}

export interface ReverseGeocodeResponse {
  placeName: string | null;
  formattedAddress: string | null;
  address: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    complemento: string;
  };
}

export const locationService = {
  // Get nearby restaurants by location
  getNearbyRestaurants: async (
    lat: number,
    lng: number,
    radius: number = 3000
  ): Promise<LocationRestaurantsResponse> => {
    const response = await axios.get('/api/location/restaurants', {
      params: {
        lat,
        lng,
        raio: radius,
      },
    });
    return response.data;
  },

  // Reverse geocode - get address from coordinates
  reverseGeocode: async (
    lat: number,
    lng: number
  ): Promise<ReverseGeocodeResponse> => {
    const response = await axios.get('/api/location/reverse-geocode', {
      params: {
        lat,
        lng,
      },
    });
    return response.data;
  },
};

