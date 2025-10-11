import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'preparationTime'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
      
      setProducts(validProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.error || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesRestaurant = !selectedRestaurant || product.restaurant._id === selectedRestaurant;
      
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
            {filteredProducts.map(product => (
              <div key={product._id} className="product-card">
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
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <h3>🔍 Nenhum produto encontrado</h3>
              <p>Tente ajustar os filtros de busca</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedRestaurant('');
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