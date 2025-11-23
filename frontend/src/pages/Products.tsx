import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { locationService } from '../services/locationService';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Products.css';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  available: boolean;
  preparationTime: number;
  restaurant: {
    _id: string;
    name: string;
    logo?: string;
  };
}

const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Todos os produtos (sem filtros de localização/favoritos)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'preparationTime'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isNearbyFilter, setIsNearbyFilter] = useState(false);
  const [isFavoritesFilter, setIsFavoritesFilter] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [nearbyRestaurantIds, setNearbyRestaurantIds] = useState<Set<string>>(new Set());

  // Carregar produtos na montagem inicial
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar favoritos de produtos quando o usuário estiver logado
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const ids = await favoriteService.getFavoriteProductIds();
          setFavoriteIds(new Set(ids));
        } catch (error) {
          console.error('Erro ao carregar favoritos de produtos:', error);
        }
      }
    };

    loadFavorites();
  }, [user]);

  // Buscar produtos quando os filtros de localização/favoritos mudarem
  useEffect(() => {
    if (isNearbyFilter) {
      fetchProductsFromNearbyRestaurants();
    } else if (isFavoritesFilter) {
      fetchProductsFromFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNearbyFilter, isFavoritesFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      const response = await axios.get('/api/products');
      console.log('Products response:', response.data);
      
      // Verificar se os produtos existem e têm a estrutura esperada
      const productsData = response.data?.products || [];
      const validProducts = productsData.filter((product: any) => 
        product && 
        product._id && 
        product.name && 
        product.restaurant && 
        product.restaurant._id && 
        product.restaurant.name
      );
      
      setAllProducts(validProducts);
      setProducts(validProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.error || 'Erro ao carregar produtos');
      setErrorMessage(err.response?.data?.error || 'Erro ao carregar produtos');
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

  // Buscar produtos de restaurantes próximos
  const fetchProductsFromNearbyRestaurants = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Obter localização do usuário
      const { lat, lng } = await getUserLocation();

      // Buscar restaurantes próximos
      const response = await locationService.getNearbyRestaurants(lat, lng, 3000);
      
      // Extrair IDs dos restaurantes próximos
      const nearbyIds = new Set(response.restaurants.map((r: any) => r.id));
      setNearbyRestaurantIds(nearbyIds);

      // Buscar todos os produtos
      const productsResponse = await axios.get('/api/products');
      const productsData = productsResponse.data?.products || [];
      
      // Filtrar produtos apenas dos restaurantes próximos
      const validProducts = productsData.filter((product: any) => 
        product && 
        product._id && 
        product.name && 
        product.restaurant && 
        product.restaurant._id && 
        product.restaurant.name &&
        nearbyIds.has(product.restaurant._id)
      );
      
      setAllProducts(validProducts);
      setProducts(validProducts);
      
      if (validProducts.length === 0) {
        setSuccessMessage('Nenhum produto encontrado em restaurantes próximos.');
      } else {
        setSuccessMessage(`${validProducts.length} produto(s) encontrado(s) em restaurantes próximos.`);
      }
    } catch (error: any) {
      console.error('Error fetching nearby products:', error);
      setErrorMessage(error.message || 'Erro ao buscar produtos próximos');
      setIsNearbyFilter(false);
    } finally {
      setLoading(false);
    }
  };

  // Buscar produtos favoritos
  const fetchProductsFromFavorites = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (!user) {
        setErrorMessage('Você precisa estar logado para ver produtos favoritos');
        setIsFavoritesFilter(false);
        return;
      }

      // Buscar produtos favoritos
      const favoriteProducts = await favoriteService.getFavoriteProducts();
      const favoriteProductIds = new Set(favoriteProducts.map((p: any) => p._id));

      if (favoriteProductIds.size === 0) {
        setAllProducts([]);
        setProducts([]);
        setSuccessMessage('Você ainda não tem produtos favoritos.');
        return;
      }

      // Buscar todos os produtos
      const productsResponse = await axios.get('/api/products');
      const productsData = productsResponse.data?.products || [];
      
      // Filtrar apenas os produtos favoritos
      const validProducts = productsData.filter((product: any) => 
        product && 
        product._id && 
        product.name && 
        product.restaurant && 
        product.restaurant._id && 
        product.restaurant.name &&
        favoriteProductIds.has(product._id)
      );
      
      setAllProducts(validProducts);
      setProducts(validProducts);
      
      if (validProducts.length === 0) {
        setSuccessMessage('Nenhum produto favorito encontrado.');
      } else {
        setSuccessMessage(`${validProducts.length} produto(s) favorito(s) encontrado(s).`);
      }
    } catch (error: any) {
      console.error('Error fetching favorite products:', error);
      setErrorMessage(error.message || 'Erro ao buscar produtos favoritos');
      setIsFavoritesFilter(false);
    } finally {
      setLoading(false);
    }
  };

  // Handler para favoritar/desfavoritar produto
  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setErrorMessage('Você precisa estar logado para favoritar produtos');
      return;
    }

    const isFavorite = favoriteIds.has(productId);
    
    // Optimistic update
    const newFavoriteIds = new Set(favoriteIds);
    if (isFavorite) {
      newFavoriteIds.delete(productId);
    } else {
      newFavoriteIds.add(productId);
    }
    setFavoriteIds(newFavoriteIds);

    try {
      if (isFavorite) {
        await favoriteService.removeFavoriteProduct(productId);
      } else {
        await favoriteService.addFavoriteProduct(productId);
      }
      
      // Se estiver no filtro de favoritos, atualizar a lista
      if (isFavoritesFilter) {
        fetchProductsFromFavorites();
      }
    } catch (error: any) {
      // Reverter optimistic update em caso de erro
      setFavoriteIds(favoriteIds);
      console.error('Error toggling favorite product:', error);
      setErrorMessage('Erro ao atualizar favorito');
    }
  };

  // Handlers para os filtros
  const handleNearbyFilter = () => {
    if (isNearbyFilter) {
      // Se já está ativo, desativar e voltar à lista normal
      setIsNearbyFilter(false);
      setNearbyRestaurantIds(new Set());
      fetchProducts();
    } else {
      // Ativar filtro e buscar produtos próximos
      setIsFavoritesFilter(false);
      setIsNearbyFilter(true);
    }
  };

  const handleFavoritesFilter = () => {
    if (isFavoritesFilter) {
      // Se já está ativo, desativar e voltar à lista normal
      setIsFavoritesFilter(false);
      fetchProducts();
    } else {
      // Ativar filtro de favoritos
      setIsNearbyFilter(false);
      setNearbyRestaurantIds(new Set());
      setIsFavoritesFilter(true);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesRestaurant = !selectedRestaurant || product.restaurant._id === selectedRestaurant;
      
      // Filtros de localização e favoritos já são aplicados em products (via fetchProductsFromNearbyRestaurants/fetchProductsFromFavorites)
      // Então aqui só aplicamos os filtros de busca, categoria e restaurante
      
      return matchesSearch && matchesCategory && matchesRestaurant;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'preparationTime':
          aValue = a.preparationTime;
          bValue = b.preparationTime;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
  const restaurants = [...new Set(products.map(product => ({ 
    _id: product.restaurant._id, 
    name: product.restaurant.name 
  })))].filter((restaurant, index, self) => 
    index === self.findIndex(r => r._id === restaurant._id)
  );

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Pizza': '🍕',
      'Hambúrguer': '🍔',
      'Sushi': '🍣',
      'Sashimi': '🍱',
      'Temaki': '🌯',
      'Hot Roll': '🍤',
      'Sopa': '🍲',
      'Carnes': '🥩',
      'Aves': '🍗',
      'Acompanhamentos': '🍟',
      'Saladas': '🥗',
      'Massa': '🍝',
      'Risotto': '🍚',
      'Tortas': '🥧',
      'Sobremesas': '🍰',
      'Doces': '🍬',
      'Cupcakes': '🧁',
      'Pudins': '🍮',
      'Macarons': '🍪',
      'Açaí': '🥤',
      'Vitaminas': '🥤',
      'Smoothies': '🥤',
      'Tacos': '🌮',
      'Burritos': '🌯',
      'Entradas': '🥘',
      'Quesadillas': '🧀',
      'Bowl': '🥣',
      'Wraps': '🌯',
      'Sucos': '🧃',
      'Kebab': '🥙',
      'Shawarma': '🥙',
      'Vegetariano': '🥬',
      'Sorvetes': '🍦',
      'Milkshakes': '🥤',
      'Bolos': '🎂',
      'Cafés': '☕',
      'Lanches': '🥪',
      'Bebidas': '🥤',
      'Gelato': '🍨',
      'Tropical': '🥭',
      'Saudável': '🥗',
      'Mediterrânea': '🫒',
      'Gourmet': '🍽️',
      'Europeia': '🇪🇺',
      'Brasileira': '🇧🇷',
      'Japonês': '🇯🇵',
      'Italiana': '🇮🇹',
      'Mexicana': '🇲🇽',
      'Árabe': '🇸🇦',
      'Churrasco': '🔥',
      'Confeitaria': '🧁',
      'Picante': '🌶️'
    };
    return icons[category] || '🍽️';
  };

  if (loading) {
    return (
      <div className="page">
        <Header />
        <main className="products-page">
          <div className="container">
            <div className="loading">Carregando produtos...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Header />
        <main className="products-page">
          <div className="container">
            <div className="error">{error}</div>
            <button onClick={fetchProducts} className="btn-retry">
              Tentar Novamente
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      
      <main className="products-page">
        <div className="container">
          <div className="products-header">
            <h1>🍽️ Produtos</h1>
            <p>Explore nossa variedade de produtos de todos os restaurantes</p>
          </div>

          {/* Filtros de localização e favoritos */}
          <div className="location-filters">
            <button
              className={`category-btn ${isNearbyFilter ? 'active' : ''}`}
              onClick={handleNearbyFilter}
            >
              📍 Perto de mim
            </button>
            {user && (
              <button
                className={`category-btn ${isFavoritesFilter ? 'active' : ''}`}
                onClick={handleFavoritesFilter}
              >
                ❤️ Favoritos
              </button>
            )}
          </div>

          {/* Mensagens de erro e sucesso */}
          {errorMessage && (
            <div className="error-message">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0',
                  marginLeft: '10px',
                }}
              >
                ×
              </button>
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0',
                  marginLeft: '10px',
                }}
              >
                ×
              </button>
            </div>
          )}

          <div className="products-filters">
            <div className="filter-group">
              <label>🔍 Buscar:</label>
              <input
                type="text"
                placeholder="Nome do produto ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label>📂 Categoria:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
                disabled={isNearbyFilter || isFavoritesFilter}
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>🏪 Restaurante:</label>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="filter-select"
                disabled={isNearbyFilter || isFavoritesFilter}
              >
                <option value="">Todos os restaurantes</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>📊 Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="filter-select"
              >
                <option value="name">Nome</option>
                <option value="price">Preço</option>
                <option value="preparationTime">Tempo de preparo</option>
              </select>
            </div>

            <div className="filter-group">
              <label>🔄 Ordem:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="filter-select"
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </div>
          </div>

          <div className="products-stats">
            <p>📊 Mostrando {filteredProducts.length} de {products.length} produtos</p>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => {
              const isFavorite = favoriteIds.has(product._id);
              return (
              <div key={product._id} className="product-card-wrapper" style={{ position: 'relative' }}>
                {user && (
                  <button
                    className="favorite-btn"
                    onClick={(e) => handleToggleFavorite(e, product._id)}
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
                        fontSize: '20px',
                        transition: 'all 0.3s ease',
                        display: 'block',
                      }}
                    >
                      {isFavorite ? '❤️' : '🤍'}
                    </span>
                  </button>
                )}
              <div className="product-card">
                <div className="product-header">
                  <div className="product-category">
                    {getCategoryIcon(product.category)} {product.category}
                  </div>
                  <div className={`product-availability ${product.available ? 'available' : 'unavailable'}`}>
                    {product.available ? '✅ Disponível' : '❌ Indisponível'}
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-restaurant">
                    <span className="restaurant-label">🏪 Restaurante:</span>
                    <Link 
                      to={`/restaurants/${product.restaurant._id}`}
                      className="restaurant-link"
                    >
                      {product.restaurant.name}
                    </Link>
                  </div>

                  <div className="product-details">
                    <div className="detail-item">
                      <span className="detail-label">💰 Preço:</span>
                      <span className="detail-value">R$ {product.price.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏱️ Preparo:</span>
                      <span className="detail-value">{product.preparationTime} min</span>
                    </div>
                  </div>
                </div>

                <div className="product-actions">
                  <Link 
                    to={`/restaurants/${product.restaurant._id}`}
                    className="btn-view-restaurant"
                  >
                    Ver Restaurante
                  </Link>
                  {product.available && (
                    <Link 
                      to={`/restaurants/${product.restaurant._id}`}
                      className="btn-order"
                    >
                      Pedir Agora
                    </Link>
                  )}
                </div>
              </div>
              </div>
            );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <h3>🔍 Nenhum produto encontrado</h3>
              <p>
                {isNearbyFilter
                  ? 'Nenhum produto encontrado em restaurantes próximos.'
                  : isFavoritesFilter
                  ? 'Nenhum produto encontrado nos seus restaurantes favoritos.'
                  : 'Tente ajustar os filtros de busca'}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedRestaurant('');
                  setIsNearbyFilter(false);
                  setIsFavoritesFilter(false);
                  setNearbyRestaurantIds(new Set());
                  fetchProducts();
                }}
                className="btn-clear-filters"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;