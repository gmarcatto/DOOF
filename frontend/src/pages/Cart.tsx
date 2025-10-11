import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import '../styles/Cart.css';

const Cart: React.FC = () => {
  const { items, restaurant, removeItem, updateQuantity, clearCart, getSubtotal, getTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!restaurant) return;
    
    const subtotal = getSubtotal();
    if (subtotal < restaurant.minimumOrder) {
      alert(`O pedido mínimo é de R$ ${restaurant.minimumOrder.toFixed(2)}`);
      return;
    }

    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="page">
        <Header />
        
        <main className="cart-page">
          <div className="container">
            <h1>Carrinho</h1>
            
            <div className="empty-cart">
              <p>🛒 Seu carrinho está vazio</p>
              <Link to="/restaurants" className="btn-primary">
                Ver Restaurantes
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      
      <main className="cart-page">
        <div className="container">
          <div className="cart-header">
            <h1>Carrinho</h1>
            <button onClick={clearCart} className="btn-clear">
              Limpar Carrinho
            </button>
          </div>

          {restaurant && (
            <div className="restaurant-info-cart">
              <h2>🏪 {restaurant.name}</h2>
              <p>Taxa de entrega: R$ {restaurant.deliveryFee.toFixed(2)}</p>
              <p>Pedido mínimo: R$ {restaurant.minimumOrder.toFixed(2)}</p>
            </div>
          )}

          <div className="cart-items">
            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                {item.image && (
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                )}
                
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">R$ {item.price.toFixed(2)}</p>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="btn-remove"
                  >
                    🗑️
                  </button>
                </div>

                <div className="cart-item-total">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>R$ {getSubtotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Taxa de entrega:</span>
              <span>R$ {restaurant?.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>R$ {getTotal().toFixed(2)}</span>
            </div>

            {restaurant && getSubtotal() < restaurant.minimumOrder && (
              <div className="warning-message">
                Faltam R$ {(restaurant.minimumOrder - getSubtotal()).toFixed(2)} para o pedido mínimo
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="btn-checkout"
              disabled={restaurant ? getSubtotal() < restaurant.minimumOrder : true}
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;




