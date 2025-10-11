import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Checkout.css';

const Checkout: React.FC = () => {
  const { items, restaurant, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    number: user?.address?.number || '',
    complement: user?.address?.complement || '',
    neighborhood: user?.address?.neighborhood || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });

  const [pickupAddress, setPickupAddress] = useState({
    restaurantAddress: '',
    instructions: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'cash' | 'pix'>('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderData = {
        restaurant: restaurant?.id,
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? address : undefined,
        pickupAddress: deliveryType === 'pickup' ? {
          ...pickupAddress,
          restaurantAddress: `${restaurant?.name} - ${restaurant?.address || 'Endereço do restaurante'}`
        } : undefined,
        paymentMethod,
      };

      const response = await axios.post('/api/orders', orderData);
      const orderId = response.data.order._id;

      clearCart();
      navigate(`/orders/${orderId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant || items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page">
      <Header />
      
      <main className="checkout-page">
        <div className="container">
          <h1>Finalizar Pedido</h1>

          {error && <div className="error-message">{error}</div>}

          <div className="checkout-content">
            <form onSubmit={handleSubmit} className="checkout-form">
              <section className="checkout-section">
                <h2>Tipo de Pedido</h2>
                
                <div className="delivery-options">
                  <label className={`delivery-option ${deliveryType === 'delivery' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value as 'delivery')}
                    />
                    <span>🏍️ Entrega</span>
                    <small>Taxa: R$ {restaurant?.deliveryFee?.toFixed(2) || '0.00'}</small>
                  </label>
                  
                  <label className={`delivery-option ${deliveryType === 'pickup' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value as 'pickup')}
                    />
                    <span>🏪 Retirar no Local</span>
                    <small>Taxa: Grátis</small>
                  </label>
                </div>
              </section>

              {deliveryType === 'delivery' && (
                <section className="checkout-section">
                  <h2>Endereço de Entrega</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>CEP</label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      required
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group flex-3">
                    <label>Rua</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group flex-1">
                    <label>Número</label>
                    <input
                      type="text"
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Complemento</label>
                    <input
                      type="text"
                      value={address.complement}
                      onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                      placeholder="Apto, bloco, etc"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Bairro</label>
                    <input
                      type="text"
                      value={address.neighborhood}
                      onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Cidade</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Estado</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      required
                      maxLength={2}
                      placeholder="UF"
                    />
                  </div>
                </div>
              </section>
              )}

              {deliveryType === 'pickup' && (
                <section className="checkout-section">
                  <h2>Retirar no Local</h2>
                  
                  <div className="restaurant-address">
                    <h3>📍 Endereço do Restaurante</h3>
                    <p><strong>{restaurant?.name}</strong></p>
                    <p>{restaurant?.address || 'Endereço do restaurante'}</p>
                  </div>
                  
                  <div className="form-group">
                    <label>Instruções para retirada (opcional)</label>
                    <textarea
                      value={pickupAddress.instructions}
                      onChange={(e) => setPickupAddress({...pickupAddress, instructions: e.target.value})}
                      placeholder="Ex: Pedido para João, pagamento no local"
                      rows={3}
                    />
                  </div>
                </section>
              )}

              <section className="checkout-section">
                <h2>Forma de Pagamento</h2>
                
                <div className="payment-methods">
                  <label className={`payment-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    />
                    <span>💳 Cartão de Crédito</span>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'debit_card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="debit_card"
                      checked={paymentMethod === 'debit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    />
                    <span>💳 Cartão de Débito</span>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'pix' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="pix"
                      checked={paymentMethod === 'pix'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    />
                    <span>📱 PIX</span>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    />
                    <span>💵 Dinheiro</span>
                  </label>
                </div>
              </section>

              <button type="submit" className="btn-submit-order" disabled={loading}>
                {loading ? 'Finalizando...' : `Finalizar Pedido - R$ ${(deliveryType === 'pickup' ? getTotal() - (restaurant?.deliveryFee || 0) : getTotal()).toFixed(2)}`}
              </button>
            </form>

            <aside className="order-summary">
              <h2>Resumo do Pedido</h2>
              
              <div className="summary-restaurant">
                <h3>{restaurant.name}</h3>
              </div>

              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.productId} className="summary-item">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>R$ {(getTotal() - (deliveryType === 'pickup' ? 0 : restaurant.deliveryFee)).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>{deliveryType === 'pickup' ? 'Taxa de entrega:' : 'Taxa de entrega:'}</span>
                  <span>R$ {deliveryType === 'pickup' ? '0.00' : restaurant.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>R$ {(deliveryType === 'pickup' ? getTotal() - restaurant.deliveryFee : getTotal()).toFixed(2)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;


