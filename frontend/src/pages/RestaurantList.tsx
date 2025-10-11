import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
}

const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, [search, category]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params: any = { isActive: 'true' };
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await axios.get('/api/restaurants', { params });
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
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
                className={`category-btn ${category === '' ? 'active' : ''}`}
                onClick={() => setCategory('')}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading">Carregando restaurantes...</div>
          ) : restaurants.length === 0 ? (
            <div className="no-results">
              <p>Nenhum restaurante encontrado</p>
            </div>
          ) : (
            <div className="restaurant-grid">
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant._id}
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
                    </div>
                    
                    <div className="restaurant-categories">
                      {restaurant.category.map((cat, index) => (
                        <span key={index} className="category-tag">{cat}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantList;




