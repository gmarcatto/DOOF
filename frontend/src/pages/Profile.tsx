import { useState, FormEvent } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      number: user?.address?.number || '',
      complement: user?.address?.complement || '',
      neighborhood: user?.address?.neighborhood || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
    },
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await axios.put(`/api/users/${user?.id}`, formData);
      setMessage('Perfil atualizado com sucesso!');
      setEditing(false);
      
      // Reload page to update user data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <Header />
      
      <main className="profile-page">
        <div className="container">
          <div className="profile-header">
            <h1>Meu Perfil</h1>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-edit">
                ✏️ Editar
              </button>
            )}
          </div>

          {message && (
            <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="profile-content">
            {user.avatar && (
              <div className="profile-avatar">
                <img src={user.avatar} alt={user.name} />
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                  <h2>Informações Pessoais</h2>
                  
                  <div className="form-group">
                    <label>Nome</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="input-disabled"
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2>Endereço</h2>
                  
                  <div className="form-group">
                    <label>CEP</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-3">
                      <label>Rua</label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="form-group flex-1">
                      <label>Número</label>
                      <input
                        type="text"
                        name="address.number"
                        value={formData.address.number}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Complemento</label>
                    <input
                      type="text"
                      name="address.complement"
                      value={formData.address.complement}
                      onChange={handleChange}
                      placeholder="Apto, bloco, etc"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Bairro</label>
                      <input
                        type="text"
                        name="address.neighborhood"
                        value={formData.address.neighborhood}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Cidade</label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Estado</label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        maxLength={2}
                        placeholder="UF"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setEditing(false)} className="btn-cancel">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-display">
                <div className="info-section">
                  <h2>Informações Pessoais</h2>
                  <div className="info-item">
                    <span className="info-label">Nome:</span>
                    <span>{user.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Telefone:</span>
                    <span>{user.phone || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tipo de conta:</span>
                    <span>{user.role === 'customer' ? 'Cliente' : user.role === 'restaurant' ? 'Restaurante' : 'Admin'}</span>
                  </div>
                </div>

                {user.address && (
                  <div className="info-section">
                    <h2>Endereço</h2>
                    <div className="address-display">
                      <p>{user.address.street}, {user.address.number}</p>
                      {user.address.complement && <p>{user.address.complement}</p>}
                      <p>{user.address.neighborhood}</p>
                      <p>{user.address.city} - {user.address.state}</p>
                      <p>CEP: {user.address.zipCode}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;




