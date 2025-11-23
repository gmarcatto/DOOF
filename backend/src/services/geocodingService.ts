import https from 'https';

/**
 * Serviço para realizar reverse geocoding usando Google Geocoding API
 * Converte coordenadas (lat/lng) em nome de lugar
 */

interface GeocodingResult {
  placeName: string | null;
  formattedAddress: string | null;
  error?: string;
}

/**
 * Verifica se uma string é um Google Plus Code
 * Plus Codes têm formato como: "89XF+RV", "8FVC+2M", "GG88+MM", etc.
 */
const isPlusCode = (str: string): boolean => {
  if (!str) return false;
  const trimmed = str.trim();
  // Plus Codes têm formato: letras/números + "+" + letras/números
  // Exemplos: "89XF+RV", "GG88+MM", "8FVC+2M"
  // Padrão: 4-8 caracteres alfanuméricos, um "+", e 2-3 caracteres alfanuméricos
  const plusCodePattern = /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,3}$/i;
  return plusCodePattern.test(trimmed);
};

/**
 * Verifica se uma string parece ser um endereço legível
 * (não é Plus Code, não é só números, tem pelo menos 3 caracteres)
 */
const isReadableAddress = (str: string): boolean => {
  if (!str || str.trim().length < 3) return false;
  if (isPlusCode(str)) return false;
  if (/^\d+$/.test(str.trim())) return false; // Só números
  return true;
};

/**
 * Realiza reverse geocoding para obter nome do lugar a partir de coordenadas
 * @param latitude Latitude
 * @param longitude Longitude
 * @returns Nome do lugar ou null se não encontrado
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodingResult> => {
  try {
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ GOOGLE_GEOCODING_API_KEY não configurada');
      return {
        placeName: null,
        formattedAddress: null,
        error: 'API key não configurada',
      };
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=pt-BR`;

    // Fazer requisição HTTP usando módulo nativo
    const response = await new Promise<any>((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });

    if (response.status === 'OK' && response.results.length > 0) {
      const result = response.results[0];

      // Tentar extrair nome do lugar (preferir estabelecimentos, pontos de interesse)
      let placeName: string | null = null;

      // Procurar por tipos que indicam nome de lugar
      const placeTypes = [
        'establishment',
        'point_of_interest',
        'shopping_mall',
        'park',
        'subway_station',
        'transit_station',
        'university',
        'hospital',
        'stadium',
      ];

      // Verificar se há um nome de estabelecimento
      if (result.types.some((type: string) => placeTypes.includes(type))) {
        const name = result.name || null;
        // Só usar se não for Plus Code
        if (name && isReadableAddress(name)) {
          placeName = name;
        }
      }

      // Se não encontrou nome específico, tentar usar o primeiro componente de endereço
      // que pode ser um nome de lugar (ex: "Shopping Center Norte")
      if (!placeName && result.address_components) {
        // Procurar por componentes que podem ser nomes de lugares
        const placeComponent = result.address_components.find(
          (component: any) =>
            (component.types.includes('establishment') ||
              component.types.includes('point_of_interest')) &&
            isReadableAddress(component.long_name)
        );

        if (placeComponent) {
          placeName = placeComponent.long_name;
        } else {
          // Procurar por rua (route) que geralmente é mais legível
          const routeComponent = result.address_components.find(
            (component: any) =>
              component.types.includes('route') &&
              isReadableAddress(component.long_name)
          );

          if (routeComponent) {
            placeName = routeComponent.long_name;
          } else {
            // Tentar usar o primeiro componente legível
            const readableComponent = result.address_components.find(
              (component: any) =>
                !component.types.includes('street_number') &&
                !component.types.includes('postal_code') &&
                !component.types.includes('plus_code') &&
                isReadableAddress(component.long_name)
            );

            if (readableComponent) {
              placeName = readableComponent.long_name;
            }
          }
        }
      }

      // Se ainda não encontrou, usar o formatted_address como fallback
      // mas tentar extrair apenas a parte relevante e evitar Plus Codes
      if (!placeName && result.formatted_address) {
        const addressParts = result.formatted_address.split(',');
        // Procurar a primeira parte legível (não Plus Code)
        for (const part of addressParts) {
          const trimmedPart = part.trim();
          if (isReadableAddress(trimmedPart)) {
            placeName = trimmedPart;
            break;
          }
        }
      }

      return {
        placeName: placeName || null,
        formattedAddress: result.formatted_address || null,
      };
    } else if (response.status === 'ZERO_RESULTS') {
      return {
        placeName: null,
        formattedAddress: null,
        error: 'Nenhum resultado encontrado',
      };
    } else {
      console.error('Erro na API de Geocoding:', response.status);
      return {
        placeName: null,
        formattedAddress: null,
        error: `Status da API: ${response.status}`,
      };
    }
  } catch (error: any) {
    console.error('Erro ao realizar reverse geocoding:', error.message);
    return {
      placeName: null,
      formattedAddress: null,
      error: error.message || 'Erro desconhecido',
    };
  }
};

/**
 * Atualiza o placeName de um restaurante usando reverse geocoding
 * @param restaurant Restaurante com coordenadas
 * @returns Nome do lugar encontrado ou null
 */
export const updateRestaurantPlaceName = async (
  restaurant: any
): Promise<string | null> => {
  if (
    !restaurant.address?.coordinates?.latitude ||
    !restaurant.address?.coordinates?.longitude
  ) {
    console.warn(
      `⚠️ Restaurante ${restaurant.name} não possui coordenadas`
    );
    return null;
  }

  const { latitude, longitude } = restaurant.address.coordinates;
  const result = await reverseGeocode(latitude, longitude);

  // Só retornar se for um endereço legível (não Plus Code)
  if (result.placeName && isReadableAddress(result.placeName)) {
    return result.placeName;
  }

  // Se não encontrou placeName legível, retornar null
  // O frontend usará o endereço formatado do banco de dados
  return null;
};

