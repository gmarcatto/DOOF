import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomSheet from '../components/BottomSheet';
import AddressForm from '../components/AddressForm';
import { addressService, Address, CreateAddressData, UpdateAddressData } from '../services/addressService';
import { locationService } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Addresses.css';

const Addresses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAll();
      setAddresses(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Obter localização do usuário
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      const { latitude, longitude } = position.coords;

      // Fazer reverse geocoding para obter endereço
      const geocodeResult = await locationService.reverseGeocode(latitude, longitude);

      if (!geocodeResult.address || !geocodeResult.address.rua) {
        setError('Não foi possível obter o endereço a partir da localização. Tente novamente.');
        return;
      }

      // Preencher o formulário com os dados obtidos
      const addressData: CreateAddressData = {
        rua: geocodeResult.address.rua || geocodeResult.placeName || '',
        numero: geocodeResult.address.numero || '',
        bairro: geocodeResult.address.bairro || '',
        cidade: geocodeResult.address.cidade || '',
        estado: geocodeResult.address.estado || '',
        complemento: geocodeResult.address.complemento || '',
        selected: false,
      };

      // Validar se temos pelo menos rua e cidade (campos obrigatórios)
      if (!addressData.rua || !addressData.cidade) {
        setError('Não foi possível obter informações suficientes do endereço. Tente adicionar manualmente.');
        return;
      }

      // Criar o endereço automaticamente
      await addressService.create(addressData);
      await fetchAddresses();
      
      // Limpar erro
      setError('');
    } catch (err: any) {
      console.error('Erro ao usar localização:', err);
      if (err.code === 1) {
        setError('Permissão de localização negada. Por favor, permita o acesso à localização.');
      } else if (err.code === 2) {
        setError('Localização indisponível.');
      } else if (err.code === 3) {
        setError('Tempo de espera para obter localização expirado.');
      } else {
        setError(err.response?.data?.error || err.message || 'Erro ao obter localização');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressClick = (address: Address) => {
    setSelectedAddress(address);
    setShowBottomSheet(true);
  };

  const handleSelectAddress = async (address: Address) => {
    try {
      await addressService.select(address._id);
      await fetchAddresses();
      setShowBottomSheet(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao selecionar endereço');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowBottomSheet(false);
    setShowFormModal(true);
  };

  const handleDelete = async (address: Address) => {
    if (!window.confirm('Tem certeza que deseja excluir este endereço?')) {
      return;
    }

    try {
      await addressService.delete(address._id);
      await fetchAddresses();
      setShowBottomSheet(false);
      setSelectedAddress(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir endereço');
    }
  };

  const handleCreateNew = () => {
    setEditingAddress(null);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (data: CreateAddressData | UpdateAddressData) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (editingAddress) {
        await addressService.update(editingAddress._id, data);
      } else {
        await addressService.create(data as CreateAddressData);
      }

      await fetchAddresses();
      setShowFormModal(false);
      setEditingAddress(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar endereço');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAddresses = addresses.filter((address) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      address.rua.toLowerCase().includes(searchLower) ||
      address.numero.toLowerCase().includes(searchLower) ||
      address.bairro.toLowerCase().includes(searchLower) ||
      address.cidade.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="page">
        <Header />
        <div className="addresses-container">
          <div className="loading">Carregando endereços...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      <div className="addresses-container">
        <div className="addresses-header">
          <h1>ENDEREÇO DE ENTREGA</h1>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar endereço e número"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Use Location Button */}
        <button className="use-location-btn" onClick={handleUseLocation}>
          <span className="gps-icon">📍</span>
          <div className="location-text">
            <div className="location-label">Usar minha localização</div>
            <div className="location-address">Rua Professor Sylla Mattos - Jardim Santa Emilia - São Paulo</div>
          </div>
        </button>

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Addresses List */}
        <div className="addresses-list">
          {filteredAddresses.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? 'Nenhum endereço encontrado' : 'Nenhum endereço cadastrado'}
            </div>
          ) : (
            filteredAddresses.map((address) => (
              <div
                key={address._id}
                className={`address-item ${address.selected ? 'selected' : ''}`}
                onClick={() => handleSelectAddress(address)}
              >
                <div className="address-content">
                  <div className="address-main">
                    <div className="address-street">
                      {address.rua}, {address.numero}
                    </div>
                    <div className="address-details">
                      <span className="address-neighborhood">{address.bairro}</span>
                      <span className="address-city">
                        {address.cidade}/{address.estado}
                      </span>
                      {address.complemento && (
                        <span className="address-complement">{address.complemento}</span>
                      )}
                    </div>
                  </div>
                  {address.selected && (
                    <div className="selected-indicator">
                      <span className="check-icon">✓</span>
                    </div>
                  )}
                </div>
                <button
                  className="options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddressClick(address);
                  }}
                >
                  ⋮
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add New Address Button */}
        <button className="add-address-btn" onClick={handleCreateNew}>
          + Adicionar novo endereço
        </button>

        {/* Bottom Sheet for Options */}
        <BottomSheet
          isOpen={showBottomSheet}
          onClose={() => {
            setShowBottomSheet(false);
            setSelectedAddress(null);
          }}
          title={selectedAddress ? `${selectedAddress.rua}, ${selectedAddress.numero}` : ''}
        >
          <button
            className="bottom-sheet-option delete"
            onClick={() => selectedAddress && handleDelete(selectedAddress)}
          >
            <span className="option-icon">🗑️</span>
            <span>Excluir</span>
          </button>
          <button
            className="bottom-sheet-option edit"
            onClick={() => selectedAddress && handleEdit(selectedAddress)}
          >
            <span className="option-icon">✏️</span>
            <span>Editar</span>
          </button>
          <button
            className="bottom-sheet-option cancel"
            onClick={() => {
              setShowBottomSheet(false);
              setSelectedAddress(null);
            }}
          >
            Cancelar
          </button>
        </BottomSheet>

        {/* Form Modal */}
        {showFormModal && (
          <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingAddress ? 'Editar Endereço' : 'Novo Endereço'}</h2>
                <button className="close-btn" onClick={() => setShowFormModal(false)}>
                  ×
                </button>
              </div>
              <AddressForm
                address={editingAddress}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowFormModal(false);
                  setEditingAddress(null);
                }}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Addresses;

