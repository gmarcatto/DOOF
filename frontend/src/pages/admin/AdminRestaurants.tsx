import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/Admin.css';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  category: string[];
  phone: string;
  email: string;
  deliveryFee: number;
  minimumOrder: number;
  isActive: boolean;
  rating: number;
  owner: any;
}

const AdminRestaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    deliveryFee: '',
    minimumOrder: '',
    logo: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/restaurants');
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await axios.put(`/api/restaurants/${id}`, { isActive: !isActive });
      fetchRestaurants();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao atualizar restaurante');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este restaurante?')) return;

    try {
      await axios.delete(`/api/restaurants/${id}`);
      fetchRestaurants();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir restaurante');
    }
  };

  const handleOpenModal = (restaurant?: Restaurant) => {
    if (restaurant) {
      setEditingRestaurant(restaurant);
      setFormData({
        name: restaurant.name,
        description: restaurant.description,
        category: restaurant.category.join(', '),
        phone: restaurant.phone,
        email: restaurant.email,
        deliveryFee: restaurant.deliveryFee.toString(),
        minimumOrder: restaurant.minimumOrder.toString(),
        logo: '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
    } else {
      setEditingRestaurant(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        phone: '',
        email: '',
        deliveryFee: '',
        minimumOrder: '',
        logo: '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRestaurant(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        category: formData.category.split(',').map(c => c.trim()),
        deliveryFee: parseFloat(formData.deliveryFee),
        minimumOrder: parseFloat(formData.minimumOrder)
      };

      if (editingRestaurant) {
        await axios.put(`/api/restaurants/${editingRestaurant._id}`, data);
        alert('Restaurante atualizado com sucesso!');
      } else {
        await axios.post('/api/restaurants', data);
        alert('Restaurante criado com sucesso!');
      }
      
      handleCloseModal();
      fetchRestaurants();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar restaurante');
    }
  };

  return (
    <div className="page">
      <Header />
      
      <main className="admin-page">
        <div className="container">
          <div className="admin-header">
            <h1>Gerenciar Restaurantes</h1>
            <button onClick={() => handleOpenModal()} className="btn-primary">
              ➕ Novo Restaurante
            </button>
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Categorias</th>
                    <th>Taxa de Entrega</th>
                    <th>Avaliação</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant._id}>
                      <td>{restaurant.name}</td>
                      <td>{restaurant.email}</td>
                      <td>{restaurant.phone}</td>
                      <td>{restaurant.category.join(', ')}</td>
                      <td>R$ {restaurant.deliveryFee.toFixed(2)}</td>
                      <td>⭐ {restaurant.rating.toFixed(1)}</td>
                      <td>
                        <span className={`badge ${restaurant.isActive ? 'badge-success' : 'badge-error'}`}>
                          {restaurant.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleOpenModal(restaurant)}
                          className="btn-action btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleActive(restaurant._id, restaurant.isActive)}
                          className="btn-action btn-toggle"
                          title={restaurant.isActive ? 'Desativar' : 'Ativar'}
                        >
                          {restaurant.isActive ? '🔴' : '🟢'}
                        </button>
                        <button
                          onClick={() => handleDelete(restaurant._id)}
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
              <h2>{editingRestaurant ? 'Editar Restaurante' : 'Novo Restaurante'}</h2>
              <button onClick={handleCloseModal} className="btn-close">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
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
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descrição *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telefone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 1234-5678"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Categorias * (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Brasileira, Pizza, Lanches"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Taxa de Entrega (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pedido Mínimo (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>URL do Logo</label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <h3>Endereço</h3>

              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Rua *</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, street: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Número *</label>
                  <input
                    type="text"
                    value={formData.address.number}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, number: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Complemento</label>
                  <input
                    type="text"
                    value={formData.address.complement}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, complement: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Bairro *</label>
                  <input
                    type="text"
                    value={formData.address.neighborhood}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, neighborhood: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cidade *</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, city: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, state: e.target.value }
                    })}
                    maxLength={2}
                    placeholder="SP"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CEP *</label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                    placeholder="12345-678"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingRestaurant ? 'Atualizar' : 'Criar'}
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

export default AdminRestaurants;

