import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/MyOrders.css';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  restaurant: any;
  items: any[];
  total: number;
  createdAt: string;
  estimatedDeliveryTime: string;
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter) params.status = filter;

      const response = await axios.get('/api/orders', { params });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Aguardando',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Pronto',
      in_delivery: 'Em entrega',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    if (status === 'delivered') return 'status-success';
    if (status === 'cancelled') return 'status-error';
    return 'status-pending';
  };

  const canCancelOrder = (status: string) => {
    return status !== 'delivered' && status !== 'cancelled' && status !== 'in_delivery';
  };

  const handleCancelOrder = async (e: React.MouseEvent, orderId: string) => {
    e.preventDefault(); // Previne a navegação do Link
    e.stopPropagation();
    
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) return;
    
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: 'cancelled' });
      alert('Pedido cancelado com sucesso!');
      fetchOrders(); // Recarrega a lista
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao cancelar pedido');
    }
  };

  return (
    <div className="page">
      <Header />
      
      <main className="my-orders-page">
        <div className="container">
          <h1>Meus Pedidos</h1>

          <div className="order-filters">
            <button
              className={`filter-btn ${filter === '' ? 'active' : ''}`}
              onClick={() => setFilter('')}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Em andamento
            </button>
            <button
              className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              Entregues
            </button>
            <button
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelados
            </button>
          </div>

          {loading ? (
            <div className="loading">Carregando pedidos...</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <p>📋 Você ainda não fez nenhum pedido</p>
              <Link to="/restaurants" className="btn-primary">
                Ver Restaurantes
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <Link to={`/orders/${order._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="order-card-header">
                      <div>
                        <h3>{order.restaurant.name}</h3>
                        <p className="order-number">Pedido {order.orderNumber}</p>
                      </div>
                      <span className={`order-status ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="order-card-items">
                      {order.items.slice(0, 3).map((item: any, index: number) => (
                        <span key={index}>
                          {item.quantity}x {item.name}
                          {index < Math.min(order.items.length, 3) - 1 && ', '}
                        </span>
                      ))}
                      {order.items.length > 3 && ` +${order.items.length - 3} itens`}
                    </div>
                  </Link>

                  <div className="order-card-footer" style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Link 
                        to={`/orders/${order._id}/invoice`}
                        className="btn-invoice-small"
                        style={{
                          background: '#28a745',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                        }}
                      >
                        📄 NF
                      </Link>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="order-footer-right">
                      <span className="order-total">R$ {order.total.toFixed(2)}</span>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={(e) => handleCancelOrder(e, order._id)}
                          className="btn-cancel-order"
                          title="Cancelar pedido"
                        >
                          ✕ Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;

