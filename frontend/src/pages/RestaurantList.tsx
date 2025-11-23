import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { locationService } from '../services/locationService';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/RestaurantList.css';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  category: string[];
  logo?: string;
  banner?: string;
  rating: number;
  totalReviews: number;
  deliveryFee: number;
  averageDeliveryTime: number;
  minimumOrder: number;
  isActive: boolean;
  distancia_metros?: number; // Adicionado para restaurantes próximos
}

const RestaurantList: React.FC = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isNearbyFilter, setIsNearbyFilter] = useState(false);
  const [isFavoritesFilter, setIsFavoritesFilter] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Carregar favoritos quando o usuário estiver logado
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const ids = await favoriteService.getFavoriteRestaurantIds();
          setFavoriteIds(new Set(ids));
        } catch (error) {
          console.error('Erro ao carregar favoritos:', error);
        }
      }
    };

    loadFavorites();
  }, [user]);

  useEffect(() => {
    if (!isNearbyFilter && !isFavoritesFilter) {
      fetchRestaurants();
    } else if (isFavoritesFilter) {
      fetchFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, isNearbyFilter, isFavoritesFilter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      const params: any = { isActive: 'true' };
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await axios.get('/api/restaurants', { params });
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setErrorMessage('Erro ao carregar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  // Obter localização do usuário
  const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada pelo seu navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          let errorMsg = 'Erro ao obter localização';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Permissão de localização negada. Por favor, permita o acesso à localização.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Localização indisponível.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Tempo de espera para obter localização expirado.';
              break;
          }
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Buscar restaurantes próximos
  const fetchNearbyRestaurants = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Obter localização do usuário
      const { lat, lng } = await getUserLocation();

      // Buscar restaurantes próximos
      const response = await locationService.getNearbyRestaurants(lat, lng, 3000);

      // Converter formato da API para o formato esperado pelo componente
      const formattedRestaurants: Restaurant[] = response.restaurants.map((nearbyRestaurant: any) => ({
        _id: nearbyRestaurant.id,
        name: nearbyRestaurant.nome,
        description: nearbyRestaurant.description || '',
        category: nearbyRestaurant.category || [],
        logo: nearbyRestaurant.logo,
        banner: nearbyRestaurant.banner,
        rating: nearbyRestaurant.rating || 0,
        totalReviews: nearbyRestaurant.totalReviews || 0,
        deliveryFee: nearbyRestaurant.deliveryFee || 0,
        averageDeliveryTime: nearbyRestaurant.averageDeliveryTime || 0,
        minimumOrder: nearbyRestaurant.minimumOrder || 0,
        isActive: nearbyRestaurant.isActive !== undefined ? nearbyRestaurant.isActive : true,
        distancia_metros: nearbyRestaurant.distancia_metros,
      }));

      setRestaurants(formattedRestaurants);
      setIsNearbyFilter(true);
      
      if (formattedRestaurants.length === 0) {
        setSuccessMessage('Nenhum restaurante encontrado perto de você.');
      } else {
        setSuccessMessage(`${formattedRestaurants.length} restaurante(s) encontrado(s) próximo(s) de você.`);
      }
    } catch (error: any) {
      console.error('Error fetching nearby restaurants:', error);
      setErrorMessage(error.message || 'Erro ao buscar restaurantes próximos');
      setIsNearbyFilter(false);
    } finally {
      setLoading(false);
    }
  };

  // Handler para clicar no filtro "Perto de mim"
  const handleNearbyFilter = () => {
    if (isNearbyFilter) {
      // Se já está ativo, desativar e voltar à lista normal
      setIsNearbyFilter(false);
      setCategory('');
      setSearch('');
      fetchRestaurants();
    } else {
      // Ativar filtro e buscar restaurantes próximos
      fetchNearbyRestaurants();
    }
  };

  // Buscar restaurantes favoritos
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const favorites = await favoriteService.getFavoriteRestaurants();
      
      // Filtrar por busca e categoria se necessário
      let filtered = favorites;
      
      if (search) {
        filtered = filtered.filter(
          (r: any) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (category) {
        filtered = filtered.filter((r: any) =>
          r.category.includes(category)
        );
      }
      
      setRestaurants(filtered);
      
      if (filtered.length === 0) {
        setSuccessMessage('Você ainda não tem restaurantes favoritos.');
      }
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      setErrorMessage('Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  // Handler para favoritar/desfavoritar
  const handleToggleFavorite = async (e: React.MouseEvent, restaurantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setErrorMessage('Você precisa estar logado para favoritar restaurantes');
      return;
    }

    const isFavorite = favoriteIds.has(restaurantId);
    
    // Optimistic update
    const newFavoriteIds = new Set(favoriteIds);
    if (isFavorite) {
      newFavoriteIds.delete(restaurantId);
    } else {
      newFavoriteIds.add(restaurantId);
    }
    setFavoriteIds(newFavoriteIds);

    try {
      if (isFavorite) {
        await favoriteService.removeFavoriteRestaurant(restaurantId);
      } else {
        await favoriteService.addFavoriteRestaurant(restaurantId);
      }
      
      // Se estiver no filtro de favoritos, atualizar a lista
      if (isFavoritesFilter) {
        fetchFavorites();
      }
    } catch (error: any) {
      // Reverter optimistic update em caso de erro
      setFavoriteIds(favoriteIds);
      console.error('Error toggling favorite:', error);
      setErrorMessage('Erro ao atualizar favorito');
    }
  };

  // Handler para clicar no filtro "Favoritos"
  const handleFavoritesFilter = () => {
    if (isFavoritesFilter) {
      // Se já está ativo, desativar e voltar à lista normal
      setIsFavoritesFilter(false);
      setCategory('');
      setSearch('');
      setIsNearbyFilter(false);
      fetchRestaurants();
    } else {
      // Ativar filtro de favoritos
      setIsFavoritesFilter(true);
      setIsNearbyFilter(false);
      setCategory('');
      fetchFavorites();
    }
  };

  // Handler para clicar em "Todos"
  const handleAllFilter = () => {
    setIsNearbyFilter(false);
    setIsFavoritesFilter(false);
    setCategory('');
    setSearch('');
    fetchRestaurants();
  };

  const categories = ['Pizza', 'Hambúrguer', 'Japonesa', 'Italiana', 'Brasileira', 'Lanches', 'Sobremesas'];

  return (
    <div className="page">
      <Header />
      
      <main className="restaurant-list-page">
        <div className="container">
          <h1>Restaurantes</h1>

          <div className="filters">
            <input
              type="text"
              placeholder="Buscar restaurantes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <div className="category-filters">
              <button
                className={`category-btn ${!isNearbyFilter && !isFavoritesFilter && category === '' ? 'active' : ''}`}
                onClick={handleAllFilter}
              >
                Todos
              </button>
              {user && (
                <button
                  className={`category-btn ${isFavoritesFilter ? 'active' : ''}`}
                  onClick={handleFavoritesFilter}
                >
                  ❤️ Favoritos
                </button>
              )}
              <button
                className={`category-btn ${isNearbyFilter ? 'active' : ''}`}
                onClick={handleNearbyFilter}
              >
                📍 Perto de mim
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-btn ${!isNearbyFilter && !isFavoritesFilter && category === cat ? 'active' : ''}`}
                  onClick={() => {
                    setIsNearbyFilter(false);
                    setIsFavoritesFilter(false);
                    setCategory(cat);
                  }}
                  disabled={isNearbyFilter || isFavoritesFilter}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagens de erro e sucesso */}
          {errorMessage && (
            <div className="error-message" style={{ marginBottom: '20px' }}>
              {errorMessage}
              <button
                onClick={() => setErrorMessage('')}
                style={{
                  marginLeft: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ×
              </button>
            </div>
          )}

          {successMessage && (
            <div className="success-message" style={{ marginBottom: '20px' }}>
              {successMessage}
              <button
                onClick={() => setSuccessMessage('')}
                style={{
                  marginLeft: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading">Carregando restaurantes...</div>
          ) : restaurants.length === 0 ? (
            <div className="no-results">
              <p>
                {isNearbyFilter
                  ? 'Nenhum restaurante encontrado perto de você.'
                  : isFavoritesFilter
                  ? 'Você ainda não tem restaurantes favoritos.'
                  : 'Nenhum restaurante encontrado'}
              </p>
            </div>
          ) : (
            <div className="restaurant-grid">
              {restaurants.map((restaurant) => {
                const isFavorite = favoriteIds.has(restaurant._id);
                return (
                  <div key={restaurant._id} className="restaurant-card-wrapper" style={{ position: 'relative' }}>
                    {user && (
                      <button
                        className="favorite-btn"
                        onClick={(e) => handleToggleFavorite(e, restaurant._id)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 10,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        }}
                      >
                        <span
                          style={{
                            fontSize: '24px',
                            color: isFavorite ? '#e63946' : '#ccc',
                            transition: 'all 0.3s ease',
                            display: 'block',
                          }}
                        >
                          {isFavorite ? '❤️' : '🤍'}
                        </span>
                      </button>
                    )}
                    <Link
                      to={`/restaurants/${restaurant._id}`}
                      className="restaurant-card"
                    >
                      {restaurant.banner && (
                        <img src={restaurant.banner} alt={restaurant.name} className="restaurant-banner" />
                      )}
                      
                      <div className="restaurant-info">
                        {restaurant.logo && (
                          <img src={restaurant.logo} alt={restaurant.name} className="restaurant-logo" />
                        )}
                        
                        <h3>{restaurant.name}</h3>
                        <p className="restaurant-description">{restaurant.description}</p>
                        
                        <div className="restaurant-meta">
                          <span className="rating">⭐ {restaurant.rating.toFixed(1)}</span>
                          <span>•</span>
                          <span>{restaurant.averageDeliveryTime} min</span>
                          <span>•</span>
                          <span>R$ {restaurant.deliveryFee.toFixed(2)}</span>
                          {restaurant.distancia_metros !== undefined && (
                            <>
                              <span>•</span>
                              <span className="distance">
                                📍 {restaurant.distancia_metros < 1000
                                  ? `${restaurant.distancia_metros}m`
                                  : `${(restaurant.distancia_metros / 1000).toFixed(1)}km`}
                              </span>
                            </>
                          )}
                        </div>
                        
                        <div className="restaurant-categories">
                          {restaurant.category.map((cat, index) => (
                            <span key={index} className="category-tag">{cat}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantList;




