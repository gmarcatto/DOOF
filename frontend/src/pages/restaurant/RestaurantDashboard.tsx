import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/RestaurantDashboard.css';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  category: string[];
  phone: string;
  email: string;
  deliveryFee: number;
  minimumOrder: number;
  averageDeliveryTime: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  available: boolean;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  customer: any;
  items: any[];
  total: number;
  createdAt: string;
}

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'restaurant' | 'products' | 'orders'>('restaurant');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    preparationTime: '',
    available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurant owned by user
      const restaurantsRes = await axios.get('/api/restaurants');
      const userRestaurant = restaurantsRes.data.restaurants.find(
        (r: any) => r.owner._id === user?.id
      );

      if (userRestaurant) {
        setRestaurant(userRestaurant);
        
        // Fetch products and orders
        const [productsRes, ordersRes] = await Promise.all([
          axios.get(`/api/products?restaurant=${userRestaurant._id}`),
          axios.get(`/api/orders?restaurant=${userRestaurant._id}`),
        ]);

        setProducts(productsRes.data.products);
        setOrders(ordersRes.data.orders);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        image: product.image || '',
        preparationTime: '',
        available: product.available
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        category: '',
        price: '',
        image: '',
        preparationTime: '',
        available: true
      });
    }
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant) return;
    
    try {
      const data = {
        ...productForm,
        price: parseFloat(productForm.price),
        preparationTime: productForm.preparationTime ? parseInt(productForm.preparationTime) : 30,
        restaurant: restaurant._id
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, data);
        alert('Produto atualizado com sucesso!');
      } else {
        await axios.post('/api/products', data);
        alert('Produto criado com sucesso!');
      }
      
      handleCloseProductModal();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      await axios.delete(`/api/products/${productId}`);
      alert('Produto excluído com sucesso!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir produto');
    }
  };

  const handleToggleProductAvailability = async (productId: string, available: boolean) => {
    try {
      await axios.put(`/api/products/${productId}`, { available: !available });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao atualizar disponibilidade');
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
        <main className="restaurant-dashboard">
          <div className="container">
            <div className="no-restaurant">
              <h1>Você ainda não possui um restaurante cadastrado</h1>
              <p>Entre em contato com o administrador para criar seu restaurante</p>
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
      
      <main className="restaurant-dashboard">
        <div className="container">
          <h1>Painel do Restaurante</h1>

          <div className="dashboard-tabs">
            <button
              className={`tab ${activeTab === 'restaurant' ? 'active' : ''}`}
              onClick={() => setActiveTab('restaurant')}
            >
              Restaurante
            </button>
            <button
              className={`tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Produtos ({products.length})
            </button>
            <button
              className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Pedidos ({orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})
            </button>
          </div>

          {activeTab === 'restaurant' && (
            <div className="dashboard-content">
              <div className="restaurant-info-card">
                <h2>{restaurant.name}</h2>
                <p>{restaurant.description}</p>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Email:</span>
                    <span>{restaurant.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Telefone:</span>
                    <span>{restaurant.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Taxa de Entrega:</span>
                    <span>R$ {restaurant.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Pedido Mínimo:</span>
                    <span>R$ {restaurant.minimumOrder.toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Tempo Médio:</span>
                    <span>{restaurant.averageDeliveryTime} min</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className={restaurant.isActive ? 'status-active' : 'status-inactive'}>
                      {restaurant.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="categories">
                  <span className="label">Categorias:</span>
                  {restaurant.category.map((cat, index) => (
                    <span key={index} className="category-tag">{cat}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="dashboard-content">
              <div className="content-header">
                <h2>Meus Produtos</h2>
                <button onClick={() => handleOpenProductModal()} className="btn-primary">
                  ➕ Novo Produto
                </button>
              </div>
              
              <div className="products-grid">
                {products.length === 0 ? (
                  <p>Nenhum produto cadastrado</p>
                ) : (
                  products.map((product) => (
                    <div key={product._id} className="product-card-dashboard">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="product-image-dashboard"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Sem+Imagem';
                          }}
                        />
                      )}
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="product-meta">
                        <span className="category">{product.category}</span>
                        <span className="price">R$ {product.price.toFixed(2)}</span>
                      </div>
                      <span className={`status ${product.available ? 'available' : 'unavailable'}`}>
                        {product.available ? 'Disponível' : 'Indisponível'}
                      </span>
                      
                      <div className="product-actions">
                        <button
                          onClick={() => handleOpenProductModal(product)}
                          className="btn-action btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleProductAvailability(product._id, product.available)}
                          className="btn-action btn-toggle"
                          title={product.available ? 'Desativar' : 'Ativar'}
                        >
                          {product.available ? '🔴' : '🟢'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="btn-action btn-delete"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="dashboard-content">
              <div className="orders-list-dashboard">
                {orders.length === 0 ? (
                  <p>Nenhum pedido ainda</p>
                ) : (
                  orders.map((order) => (
                    <div key={order._id} className="order-card-dashboard">
                      <div className="order-header-dashboard">
                        <h3>Pedido {order.orderNumber}</h3>
                        <span className="order-time">
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="order-customer">
                        <strong>Cliente:</strong> {order.customer.name}
                        <br />
                        <strong>Telefone:</strong> {order.customer.phone || 'Não informado'}
                      </div>

                      <div className="order-items-dashboard">
                        {order.items.map((item: any, index: number) => (
                          <div key={index}>
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>

                      <div className="order-footer-dashboard">
                        <span className="order-total">R$ {order.total.toFixed(2)}</span>
                        
                        <div className="order-status-controls">
                          <span className="current-status">{getStatusLabel(order.status)}</span>
                          
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="status-select"
                            >
                              <option value="pending">Aguardando</option>
                              <option value="confirmed">Confirmado</option>
                              <option value="preparing">Preparando</option>
                              <option value="ready">Pronto</option>
                              <option value="in_delivery">Em entrega</option>
                              <option value="delivered">Entregue</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showProductModal && (
        <div className="modal-overlay" onClick={handleCloseProductModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={handleCloseProductModal} className="btn-close">✕</button>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="form">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição *</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Entrada">Entrada</option>
                    <option value="Prato Principal">Prato Principal</option>
                    <option value="Sobremesa">Sobremesa</option>
                    <option value="Bebida">Bebida</option>
                    <option value="Lanche">Lanche</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Sushi">Sushi</option>
                    <option value="Hambúrguer">Hambúrguer</option>
                    <option value="Massa">Massa</option>
                    <option value="Salada">Salada</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>URL da Imagem *</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tempo de Preparo (minutos)</label>
                <input
                  type="number"
                  value={productForm.preparationTime}
                  onChange={(e) => setProductForm({ ...productForm, preparationTime: e.target.value })}
                  placeholder="30"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.available}
                    onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                  />
                  <span>Disponível para pedidos</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseProductModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantDashboard;

