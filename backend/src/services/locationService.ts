import Restaurant, { IRestaurant } from '../models/Restaurant';

// Raio da Terra em metros
const EARTH_RADIUS_METERS = 6371000;

/**
 * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine
 * @param lat1 Latitude do primeiro ponto
 * @param lng1 Longitude do primeiro ponto
 * @param lat2 Latitude do segundo ponto
 * @param lng2 Longitude do segundo ponto
 * @returns Distância em metros
 */
export const calculateHaversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  // Converter graus para radianos
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

/**
 * Converte graus para radianos
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Filtra e ordena restaurantes por distância
 * @param restaurants Lista de restaurantes
 * @param userLat Latitude do usuário
 * @param userLng Longitude do usuário
 * @param radiusMeters Raio em metros (opcional, se não fornecido retorna todos ordenados)
 * @returns Lista de restaurantes com distância calculada, filtrados e ordenados
 */
export const filterAndSortRestaurantsByDistance = (
  restaurants: IRestaurant[],
  userLat: number,
  userLng: number,
  radiusMeters?: number
): Array<IRestaurant & { distancia_metros: number }> => {
  // Calcular distância para cada restaurante que tem coordenadas
  const restaurantsWithDistance = restaurants
    .filter((restaurant) => {
      return (
        restaurant.address?.coordinates?.latitude !== undefined &&
        restaurant.address?.coordinates?.longitude !== undefined
      );
    })
    .map((restaurant) => {
      const restaurantLat = restaurant.address!.coordinates!.latitude!;
      const restaurantLng = restaurant.address!.coordinates!.longitude!;

      const distancia_metros = calculateHaversineDistance(
        userLat,
        userLng,
        restaurantLat,
        restaurantLng
      );

      return {
        ...restaurant.toObject(),
        distancia_metros,
      };
    });

  // Filtrar por raio se fornecido
  let filtered = restaurantsWithDistance;
  if (radiusMeters !== undefined) {
    filtered = restaurantsWithDistance.filter(
      (r) => r.distancia_metros <= radiusMeters
    );
  }

  // Ordenar por distância (mais próximo primeiro)
  filtered.sort((a, b) => a.distancia_metros - b.distancia_metros);

  return filtered;
};




