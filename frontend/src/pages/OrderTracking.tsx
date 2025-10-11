import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/OrderTracking.css';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  customer: any;
  restaurant: any;
  items: any[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: any;
  pickupAddress?: any;
  paymentMethod: string;
  estimatedDeliveryTime: string;
  statusHistory: any[];
  createdAt: string;
}

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchOrder();

    // Connect to Socket.IO
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join_order', id);

      socket.on('order_updated', (updatedOrder) => {
        if (updatedOrder._id === id) {
          setOrder(updatedOrder);
        }
      });

      return () => {
        socket.emit('leave_order', id);
        socket.off('order_updated');
      };
    }
  }, [socket, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string, deliveryType?: string) => {
    const labels: Record<string, string> = {
      pending: 'Aguardando confirmação',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: deliveryType === 'pickup' ? 'Pronto para retirada' : 'Pronto para entrega',
      in_delivery: 'Saiu para entrega',
      delivered: 'Entregue',
      picked_up: 'Retirado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string, deliveryType?: string) => {
    const icons: Record<string, string> = {
      pending: '🕐',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: deliveryType === 'pickup' ? '📦' : '📦',
      in_delivery: '🏍️',
      delivered: '🎉',
      picked_up: '🏪',
      cancelled: '❌',
    };
    return icons[status] || '📋';
  };

  if (loading) {
    return (
      <div className="page">
        <Header />
        <div className="loading">Carregando pedido...</div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page">
        <Header />
        <div className="error">Pedido não encontrado</div>
        <Footer />
      </div>
    );
  }

  const statusSteps = order.deliveryType === 'pickup' 
    ? ['pending', 'confirmed', 'preparing', 'ready', 'picked_up']
    : ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="page">
      <Header />
      
      <main className="order-tracking-page">
        <div className="container">
          <div className="order-header">
            <h1>Pedido {order.orderNumber}</h1>
            <Link to="/orders" className="btn-back">← Voltar</Link>
          </div>

          <div className="order-status-banner">
            <div className="status-icon-large">{getStatusIcon(order.status, order.deliveryType)}</div>
            <h2>{getStatusLabel(order.status, order.deliveryType)}</h2>
            <p className="delivery-type">
              {order.deliveryType === 'pickup' ? '🏪 Retirada no Local' : '🏍️ Entrega'}
            </p>
            {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'picked_up' && (
              <p>Previsão: {new Date(order.estimatedDeliveryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            )}
          </div>

          {order.status !== 'cancelled' && (
            <div className="order-timeline">
              {statusSteps.slice(0, -1).map((step, index) => (
                <div
                  key={step}
                  className={`timeline-step ${index <= currentStepIndex ? 'completed' : ''} ${index === currentStepIndex ? 'active' : ''}`}
                >
                  <div className="timeline-icon">{getStatusIcon(step, order.deliveryType)}</div>
                  <div className="timeline-label">{getStatusLabel(step, order.deliveryType)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="order-details-grid">
            <div className="order-section">
              <h3>Itens do Pedido</h3>
              <div className="order-items">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="order-item">
                    <span className="item-quantity">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>R$ {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>{order.deliveryType === 'pickup' ? 'Taxa de entrega:' : 'Taxa de entrega:'}</span>
                  <span>R$ {order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="total-row total">
                  <span>Total:</span>
                  <span>R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="order-section">
              <h3>Informações do Restaurante</h3>
              <div className="restaurant-info">
                <h4>{order.restaurant.name}</h4>
                <p>📞 {order.restaurant.phone}</p>
              </div>

              {order.deliveryType === 'delivery' && (
                <>
                  <h3>Endereço de Entrega</h3>
                  <div className="delivery-address">
                    <p>{order.deliveryAddress.street}, {order.deliveryAddress.number}</p>
                    {order.deliveryAddress.complement && <p>{order.deliveryAddress.complement}</p>}
                    <p>{order.deliveryAddress.neighborhood}</p>
                    <p>{order.deliveryAddress.city} - {order.deliveryAddress.state}</p>
                    <p>CEP: {order.deliveryAddress.zipCode}</p>
                  </div>
                </>
              )}

              {order.deliveryType === 'pickup' && (
                <>
                  <h3>Local de Retirada</h3>
                  <div className="pickup-address">
                    <p><strong>{order.restaurant.name}</strong></p>
                    <p>{order.pickupAddress?.restaurantAddress || 'Endereço do restaurante'}</p>
                    {order.pickupAddress?.instructions && (
                      <div className="pickup-instructions">
                        <p><strong>Instruções:</strong></p>
                        <p>{order.pickupAddress.instructions}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <h3>Forma de Pagamento</h3>
              <p>
                {order.paymentMethod === 'credit_card' && '💳 Cartão de Crédito'}
                {order.paymentMethod === 'debit_card' && '💳 Cartão de Débito'}
                {order.paymentMethod === 'pix' && '📱 PIX'}
                {order.paymentMethod === 'cash' && '💵 Dinheiro'}
              </p>
            </div>
          </div>

          <div className="order-history">
            <h3>Histórico do Pedido</h3>
            <div className="history-timeline">
              {order.statusHistory.map((history: any, index: number) => (
                <div key={index} className="history-item">
                  <div className="history-icon">{getStatusIcon(history.status, order.deliveryType)}</div>
                  <div className="history-content">
                    <h4>{getStatusLabel(history.status, order.deliveryType)}</h4>
                    <p className="history-time">
                      {new Date(history.timestamp).toLocaleString('pt-BR')}
                    </p>
                    {history.note && <p className="history-note">{history.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;


