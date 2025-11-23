import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addressService, Address } from '../services/addressService';
import '../styles/Checkout.css';

const Checkout: React.FC = () => {
  const { items, restaurant, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useManualAddress, setUseManualAddress] = useState(false);
  
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [pickupAddress, setPickupAddress] = useState({
    restaurantAddress: '',
    instructions: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'cash' | 'pix'>('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restaurantDetails, setRestaurantDetails] = useState<any>(null);

  // Buscar dados completos do restaurante
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (restaurant?.id) {
        try {
          const response = await axios.get(`/api/restaurants/${restaurant.id}`);
          setRestaurantDetails(response.data.restaurant);
        } catch (error) {
          console.error('Erro ao buscar detalhes do restaurante:', error);
        }
      }
    };

    fetchRestaurantDetails();
  }, [restaurant?.id]);

  // Carregar endereços salvos
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addresses = await addressService.getAll();
        setSavedAddresses(addresses);
        
        // Selecionar o endereço marcado como selected por padrão
        const selectedAddress = addresses.find(addr => addr.selected);
        if (selectedAddress) {
          setSelectedAddressId(selectedAddress._id);
          setAddress({
            street: selectedAddress.rua,
            number: selectedAddress.numero,
            complement: selectedAddress.complemento || '',
            neighborhood: selectedAddress.bairro,
            city: selectedAddress.cidade,
            state: selectedAddress.estado,
            zipCode: '',
          });
        } else if (addresses.length > 0) {
          // Se não houver selecionado, usar o primeiro
          const firstAddress = addresses[0];
          setSelectedAddressId(firstAddress._id);
          setAddress({
            street: firstAddress.rua,
            number: firstAddress.numero,
            complement: firstAddress.complemento || '',
            neighborhood: firstAddress.bairro,
            city: firstAddress.cidade,
            state: firstAddress.estado,
            zipCode: '',
          });
        } else {
          // Se não houver endereços salvos, usar endereço do perfil ou permitir manual
          if (user?.address) {
            setAddress({
              street: user.address.street || '',
              number: user.address.number || '',
              complement: user.address.complement || '',
              neighborhood: user.address.neighborhood || '',
              city: user.address.city || '',
              state: user.address.state || '',
              zipCode: user.address.zipCode || '',
            });
          }
          setUseManualAddress(true);
        }
      } catch (error) {
        console.error('Erro ao carregar endereços:', error);
        // Fallback para endereço do perfil
        if (user?.address) {
          setAddress({
            street: user.address.street || '',
            number: user.address.number || '',
            complement: user.address.complement || '',
            neighborhood: user.address.neighborhood || '',
            city: user.address.city || '',
            state: user.address.state || '',
            zipCode: user.address.zipCode || '',
          });
        }
        setUseManualAddress(true);
      }
    };

    if (deliveryType === 'delivery') {
      fetchAddresses();
    }
  }, [deliveryType, user]);

  // Atualizar endereço quando selecionar um endereço salvo
  const handleSelectSavedAddress = (addressId: string) => {
    const selectedAddress = savedAddresses.find(addr => addr._id === addressId);
    if (selectedAddress) {
      setSelectedAddressId(addressId);
      setUseManualAddress(false);
      setAddress({
        street: selectedAddress.rua,
        number: selectedAddress.numero,
        complement: selectedAddress.complemento || '',
        neighborhood: selectedAddress.bairro,
        city: selectedAddress.cidade,
        state: selectedAddress.estado,
        zipCode: '',
      });
    }
  };

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
          restaurantAddress: restaurantDetails?.address 
            ? (restaurantDetails.address.placeName 
                ? `${restaurant?.name} - ${restaurantDetails.address.placeName}`
                : restaurantDetails.address.street && restaurantDetails.address.number
                ? `${restaurant?.name} - ${restaurantDetails.address.street}, ${restaurantDetails.address.number} - ${restaurantDetails.address.neighborhood}, ${restaurantDetails.address.city}/${restaurantDetails.address.state}`
                : `${restaurant?.name} - Endereço não disponível`)
            : `${restaurant?.name} - Endereço do restaurante`
        } : undefined,
        paymentMethod,
      };

      const response = await axios.post('/api/orders', orderData);
      const orderId = response.data.order._id;

      clearCart();
      // Redirecionar para a nota fiscal após criar o pedido
      navigate(`/orders/${orderId}/invoice`);
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
                  
                  {savedAddresses.length > 0 && !useManualAddress && (
                    <div className="saved-addresses">
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                        Selecione um endereço salvo:
                      </label>
                      <div className="address-options" style={{ marginBottom: '20px' }}>
                        {savedAddresses.map((savedAddr) => (
                          <label
                            key={savedAddr._id}
                            className={`address-option ${selectedAddressId === savedAddr._id ? 'selected' : ''}`}
                            style={{
                              display: 'block',
                              padding: '15px',
                              marginBottom: '10px',
                              border: selectedAddressId === savedAddr._id ? '2px solid #e63946' : '2px solid #ddd',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              backgroundColor: selectedAddressId === savedAddr._id ? '#fff5f5' : '#fff',
                            }}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              value={savedAddr._id}
                              checked={selectedAddressId === savedAddr._id}
                              onChange={() => handleSelectSavedAddress(savedAddr._id)}
                              style={{ marginRight: '10px' }}
                            />
                            <div>
                              <strong>{savedAddr.rua}, {savedAddr.numero}</strong>
                              {savedAddr.complemento && <span> - {savedAddr.complemento}</span>}
                              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                                {savedAddr.bairro} - {savedAddr.cidade}/{savedAddr.estado}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUseManualAddress(true);
                          setSelectedAddressId(null);
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid #e63946',
                          color: '#e63946',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginBottom: '20px',
                        }}
                      >
                        + Usar outro endereço
                      </button>
                      <div style={{ marginBottom: '20px' }}>
                        <Link
                          to="/addresses"
                          style={{
                            color: '#e63946',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                          }}
                        >
                          📍 Gerenciar meus endereços
                        </Link>
                      </div>
                    </div>
                  )}

                  {useManualAddress && (
                    <div>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setUseManualAddress(false);
                            if (savedAddresses.length > 0) {
                              handleSelectSavedAddress(savedAddresses[0]._id);
                            }
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid #e63946',
                            color: '#e63946',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginBottom: '20px',
                          }}
                        >
                          ← Voltar para endereços salvos
                        </button>
                      )}
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>CEP</label>
                          <input
                            type="text"
                            value={address.zipCode}
                            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
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
                    </div>
                  )}

                  {savedAddresses.length === 0 && (
                    <div>
                      <p style={{ marginBottom: '15px', color: '#666' }}>
                        Você ainda não tem endereços salvos.{' '}
                        <Link to="/addresses" style={{ color: '#e63946', textDecoration: 'none' }}>
                          Cadastrar endereço
                        </Link>
                      </p>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>CEP</label>
                          <input
                            type="text"
                            value={address.zipCode}
                            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
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
                    </div>
                  )}
                </section>
              )}

              {deliveryType === 'pickup' && (
                <section className="checkout-section">
                  <h2>Retirar no Local</h2>
                  
                  <div className="restaurant-address">
                    <h3>📍 Endereço do Restaurante</h3>
                    <p><strong>{restaurant?.name}</strong></p>
                    {restaurantDetails?.address ? (
                      <p>
                        {restaurantDetails.address.placeName 
                          ? restaurantDetails.address.placeName
                          : restaurantDetails.address.street && restaurantDetails.address.number
                          ? `${restaurantDetails.address.street}, ${restaurantDetails.address.number} - ${restaurantDetails.address.neighborhood}, ${restaurantDetails.address.city}/${restaurantDetails.address.state}`
                          : 'Endereço não disponível'}
                      </p>
                    ) : (
                      <p>Carregando endereço...</p>
                    )}
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


