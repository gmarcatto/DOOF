import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/Admin.css';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  restaurant: any;
}

interface Restaurant {
  _id: string;
  name: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    preparationTime: '30',
    available: true,
    restaurant: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchRestaurants();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('/api/restaurants');
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        image: (product as any).image || '',
        preparationTime: (product as any).preparationTime?.toString() || '30',
        available: product.available,
        restaurant: product.restaurant._id
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        image: '',
        preparationTime: '30',
        available: true,
        restaurant: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.restaurant) {
      alert('Por favor, selecione um restaurante');
      return;
    }

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime) || 30,
        restaurant: formData.restaurant
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, data);
        alert('Produto atualizado com sucesso!');
      } else {
        await axios.post('/api/products', data);
        alert('Produto criado com sucesso!');
      }
      
      handleCloseModal();
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar produto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir produto');
    }
  };

  const filteredProducts = filter
    ? products.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.restaurant.name.toLowerCase().includes(filter.toLowerCase())
      )
    : products;

  return (
    <div className="page">
      <Header />
      
      <main className="admin-page">
        <div className="container">
          <div className="admin-header">
            <h1>Gerenciar Produtos</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="search-input"
              />
              <button
                onClick={() => handleOpenModal()}
                className="btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                + Novo Produto
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Restaurante</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.restaurant.name}</td>
                      <td>{product.category}</td>
                      <td>R$ {product.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${product.available ? 'badge-success' : 'badge-error'}`}>
                          {product.available ? 'Disponível' : 'Indisponível'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="btn-action"
                          style={{ marginRight: '5px' }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="btn-action btn-delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Restaurante *</label>
                <select
                  value={formData.restaurant}
                  onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                  required
                  disabled={!!editingProduct}
                >
                  <option value="">Selecione um restaurante</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Categoria *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Imagem (URL)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Tempo de Preparo (minutos)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  />
                  <span>Disponível para pedidos</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
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

export default AdminProducts;




