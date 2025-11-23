import { Response } from 'express';
import https from 'https';
import Restaurant from '../models/Restaurant';
import { filterAndSortRestaurantsByDistance } from '../services/locationService';
import { reverseGeocode } from '../services/geocodingService';

/**
 * GET /api/location/restaurants
 * Busca restaurantes próximos à localização do usuário
 * Query params: lat, lng, raio (opcional, padrão: 3000 metros)
 */
export const getNearbyRestaurants = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const { lat, lng, raio } = req.query;

    // Validar parâmetros obrigatórios
    if (!lat || !lng) {
      res.status(400).json({
        error: 'Parâmetros lat e lng são obrigatórios',
      });
      return;
    }

    // Converter para números
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusMeters = raio ? parseFloat(raio as string) : 3000;

    // Validar valores
    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        error: 'lat e lng devem ser números válidos',
      });
      return;
    }

    if (latitude < -90 || latitude > 90) {
      res.status(400).json({
        error: 'latitude deve estar entre -90 e 90',
      });
      return;
    }

    if (longitude < -180 || longitude > 180) {
      res.status(400).json({
        error: 'longitude deve estar entre -180 e 180',
      });
      return;
    }

    if (radiusMeters < 0) {
      res.status(400).json({
        error: 'raio deve ser um número positivo',
      });
      return;
    }

    // Buscar todos os restaurantes ativos
    const restaurants = await Restaurant.find({ isActive: true });

    // Filtrar e ordenar por distância
    const nearbyRestaurants = filterAndSortRestaurantsByDistance(
      restaurants,
      latitude,
      longitude,
      radiusMeters
    );

    // Formatar resposta com dados completos do restaurante
    const formattedRestaurants = nearbyRestaurants.map((restaurant) => {
      // Usar placeName se disponível, senão usar endereço formatado
      const endereco = restaurant.address.placeName 
        ? restaurant.address.placeName
        : `${restaurant.address.street}, ${restaurant.address.number} - ${restaurant.address.neighborhood}, ${restaurant.address.city}/${restaurant.address.state}`;
      
      return {
        id: restaurant._id.toString(),
        nome: restaurant.name,
        endereco,
        placeName: restaurant.address.placeName || null,
        latitude: restaurant.address.coordinates!.latitude!,
        longitude: restaurant.address.coordinates!.longitude!,
        distancia_metros: Math.round(restaurant.distancia_metros),
        // Incluir dados completos para evitar requisições adicionais no frontend
        description: restaurant.description,
        category: restaurant.category,
        logo: restaurant.logo,
        banner: restaurant.banner,
        rating: restaurant.rating,
        totalReviews: restaurant.totalReviews,
        deliveryFee: restaurant.deliveryFee,
        averageDeliveryTime: restaurant.averageDeliveryTime,
        minimumOrder: restaurant.minimumOrder,
        isActive: restaurant.isActive,
      };
    });

    res.json({
      restaurants: formattedRestaurants,
      total: formattedRestaurants.length,
      raio_metros: radiusMeters,
    });
  } catch (error: any) {
    console.error('Error in getNearbyRestaurants:', error);
    res.status(500).json({
      error: error.message || 'Erro ao buscar restaurantes próximos',
    });
  }
};

/**
 * GET /api/location/reverse-geocode
 * Realiza reverse geocoding para obter endereço a partir de coordenadas
 * Query params: lat, lng
 */
export const reverseGeocodeController = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const { lat, lng } = req.query;

    // Validar parâmetros obrigatórios
    if (!lat || !lng) {
      res.status(400).json({
        error: 'Parâmetros lat e lng são obrigatórios',
      });
      return;
    }

    // Converter para números
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    // Validar valores
    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        error: 'lat e lng devem ser números válidos',
      });
      return;
    }

    if (latitude < -90 || latitude > 90) {
      res.status(400).json({
        error: 'latitude deve estar entre -90 e 90',
      });
      return;
    }

    if (longitude < -180 || longitude > 180) {
      res.status(400).json({
        error: 'longitude deve estar entre -180 e 180',
      });
      return;
    }

    // Realizar reverse geocoding - precisamos fazer a requisição diretamente aqui
    // para obter os address_components
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({
        error: 'API key de geocoding não configurada',
      });
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=pt-BR`;

    // Fazer requisição HTTP
    const geocodeResponse = await new Promise<any>((resolve, reject) => {
      https.get(url, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error: any) => {
        reject(error);
      });
    });

    if (geocodeResponse.status !== 'OK' || !geocodeResponse.results || geocodeResponse.results.length === 0) {
      res.status(404).json({
        error: 'Nenhum endereço encontrado para estas coordenadas',
      });
      return;
    }

    const result = geocodeResponse.results[0];
    const components = result.address_components || [];

    // Extrair componentes do endereço
    let rua = '';
    let numero = '';
    let bairro = '';
    let cidade = '';
    let estado = '';
    let complemento = '';

    // Extrair rua (route)
    const route = components.find((c: any) => c.types.includes('route'));
    if (route) {
      rua = route.long_name;
    }

    // Extrair número (street_number)
    const streetNumber = components.find((c: any) => c.types.includes('street_number'));
    if (streetNumber) {
      numero = streetNumber.long_name;
    }

    // Extrair bairro (sublocality, neighborhood, political)
    const neighborhood = components.find((c: any) => 
      c.types.includes('sublocality') || 
      c.types.includes('neighborhood') ||
      c.types.includes('sublocality_level_1')
    );
    if (neighborhood) {
      bairro = neighborhood.long_name;
    }

    // Extrair cidade (locality, administrative_area_level_2)
    const city = components.find((c: any) => 
      c.types.includes('locality') || 
      c.types.includes('administrative_area_level_2')
    );
    if (city) {
      cidade = city.long_name;
    }

    // Extrair estado (administrative_area_level_1)
    const state = components.find((c: any) => c.types.includes('administrative_area_level_1'));
    if (state) {
      // Pegar apenas a sigla (short_name) para estado
      estado = state.short_name;
    }

    // Obter placeName se disponível (para usar como fallback se não tiver rua)
    const resultGeocode = await reverseGeocode(latitude, longitude);
    const placeName = resultGeocode.placeName;

    // Se não encontrou rua, usar o placeName ou primeira parte do formatted_address
    if (!rua) {
      if (placeName) {
        rua = placeName;
      } else if (result.formatted_address) {
        const parts = result.formatted_address.split(',');
        rua = parts[0]?.trim() || '';
      }
    }

    res.json({
      placeName: placeName,
      formattedAddress: result.formatted_address || resultGeocode.formattedAddress,
      address: {
        rua: rua || placeName || '',
        numero: numero || '',
        bairro: bairro || '',
        cidade: cidade || '',
        estado: estado || '',
        complemento: complemento || '',
      },
    });
  } catch (error: any) {
    console.error('Error in reverseGeocodeController:', error);
    res.status(500).json({
      error: error.message || 'Erro ao realizar reverse geocoding',
    });
  }
};

