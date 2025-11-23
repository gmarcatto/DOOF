import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import '../styles/RestaurantDetail.css';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  available: boolean;
  preparationTime: number;
}

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
  address: any;
  phone: string;
}

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { addItem } = useCart();

  useEffect(() => {
    fetchRestaurantAndProducts();
  }, [id]);

  const fetchRestaurantAndProducts = async () => {
    try {
      setLoading(true);
      const [restaurantRes, productsRes] = await Promise.all([
        axios.get(`/api/restaurants/${id}`),
        axios.get(`/api/products?restaurant=${id}&available=true`),
      ]);

      setRestaurant(restaurantRes.data.restaurant);
      setProducts(productsRes.data.products);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!restaurant) return;

    addItem(
      {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      },
      {
        id: restaurant._id,
        name: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
        minimumOrder: restaurant.minimumOrder,
      }
    );

    alert(`${product.name} adicionado ao carrinho!`);
  };

  const categories = [...new Set(products.map((p) => p.category))];
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="page">
        <Header />
        <div className="loading">Carregando...</div>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="page">
        <Header />
        <div className="error">Restaurante não encontrado</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      
      <main className="restaurant-detail-page">
        <div className="restaurant-header">
          {restaurant.banner && (
            <img src={restaurant.banner} alt={restaurant.name} className="header-banner" />
          )}
          
          <div className="container">
            <div className="restaurant-header-content">
              {restaurant.logo && (
                <img src={restaurant.logo} alt={restaurant.name} className="header-logo" />
              )}
              
              <div className="header-info">
                <h1>{restaurant.name}</h1>
                <p>{restaurant.description}</p>
                
                <div className="header-meta">
                  <span className="rating">⭐ {restaurant.rating.toFixed(1)} ({restaurant.totalReviews})</span>
                  <span>•</span>
                  <span>🕐 {restaurant.averageDeliveryTime} min</span>
                  <span>•</span>
                  <span>🚚 R$ {restaurant.deliveryFee.toFixed(2)}</span>
                  <span>•</span>
                  <span>💰 Mín. R$ {restaurant.minimumOrder.toFixed(2)}</span>
                </div>
                
                {restaurant.address && (
                  <div className="restaurant-address" style={{ marginTop: '15px', fontSize: '0.95rem', color: '#666' }}>
                    <span>📍 </span>
                    {restaurant.address.placeName ? (
                      <span><strong>{restaurant.address.placeName}</strong></span>
                    ) : (
                      <span>
                        {restaurant.address.street}, {restaurant.address.number} - {restaurant.address.neighborhood}, {restaurant.address.city}/{restaurant.address.state}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="category-tabs">
            <button
              className={`category-tab ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <p>Nenhum produto disponível</p>
            ) : (
              filteredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="product-image" />
                  )}
                  
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-footer">
                      <span className="product-price">R$ {product.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-add-cart"
                        disabled={!product.available}
                      >
                        {product.available ? '+ Adicionar' : 'Indisponível'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;




