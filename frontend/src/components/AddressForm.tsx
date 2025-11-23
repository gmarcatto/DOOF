import React, { useState, useEffect } from 'react';
import { Address, CreateAddressData, UpdateAddressData } from '../services/addressService';
import './AddressForm.css';

interface AddressFormProps {
  address?: Address | null;
  onSubmit: (data: CreateAddressData | UpdateAddressData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (address) {
      setFormData({
        rua: address.rua || '',
        numero: address.numero || '',
        bairro: address.bairro || '',
        cidade: address.cidade || '',
        estado: address.estado || '',
        complemento: address.complemento || '',
      });
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.rua.trim()) {
      newErrors.rua = 'Rua é obrigatória';
    }
    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }
    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    if (!formData.estado.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    } else if (formData.estado.length !== 2) {
      newErrors.estado = 'Estado deve ter 2 letras (ex: SP)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: CreateAddressData | UpdateAddressData = {
      rua: formData.rua.trim(),
      numero: formData.numero.trim(),
      bairro: formData.bairro.trim(),
      cidade: formData.cidade.trim(),
      estado: formData.estado.trim().toUpperCase(),
      complemento: formData.complemento.trim() || undefined,
    };

    await onSubmit(submitData);
  };

  return (
    <div className="address-form-container">
      <form onSubmit={handleSubmit} className="address-form">
        <div className="form-group">
          <label htmlFor="rua">Rua *</label>
          <input
            type="text"
            id="rua"
            name="rua"
            value={formData.rua}
            onChange={handleChange}
            placeholder="Nome da rua"
            className={errors.rua ? 'error' : ''}
          />
          {errors.rua && <span className="error-message">{errors.rua}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="numero">Número *</label>
          <input
            type="text"
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            placeholder="Número"
            className={errors.numero ? 'error' : ''}
          />
          {errors.numero && <span className="error-message">{errors.numero}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="complemento">Complemento</label>
          <input
            type="text"
            id="complemento"
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
            placeholder="Apto, Bloco, etc. (opcional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bairro">Bairro *</label>
          <input
            type="text"
            id="bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
            placeholder="Nome do bairro"
            className={errors.bairro ? 'error' : ''}
          />
          {errors.bairro && <span className="error-message">{errors.bairro}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cidade">Cidade *</label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Cidade"
              className={errors.cidade ? 'error' : ''}
            />
            {errors.cidade && <span className="error-message">{errors.cidade}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado *</label>
            <input
              type="text"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              placeholder="SP"
              maxLength={2}
              className={errors.estado ? 'error' : ''}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.estado && <span className="error-message">{errors.estado}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel" disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : address ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;




