import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/Admin.css';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', phone: '', role: 'customer' });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir usuário');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, formData);
      } else {
        await axios.post('/api/users', formData);
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  return (
    <div className="page">
      <Header />
      
      <main className="admin-page">
        <div className="container">
          <div className="admin-header">
            <h1>Gerenciar Usuários</h1>
            <button onClick={handleCreate} className="btn-create">
              + Novo Usuário
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
                    <th>Tipo</th>
                    <th>Cadastrado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        <span className={`badge badge-${user.role}`}>
                          {user.role === 'customer' ? 'Cliente' : user.role === 'restaurant' ? 'Restaurante' : 'Admin'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <button onClick={() => handleEdit(user)} className="btn-action btn-edit">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(user._id)} className="btn-action btn-delete">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nome</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="customer">Cliente</option>
                      <option value="restaurant">Restaurante</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {!editingUser && (
                    <div className="form-group">
                      <label>Senha</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  )}

                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                      Cancelar
                    </button>
                    <button type="submit" className="btn-save">
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminUsers;




