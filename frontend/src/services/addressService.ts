import axios from 'axios';

export interface Address {
  _id: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
  selected?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressData {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
  selected?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

export const addressService = {
  // Get all addresses for authenticated user
  getAll: async (): Promise<Address[]> => {
    const response = await axios.get('/api/addresses');
    return response.data.addresses;
  },

  // Get single address by ID
  getById: async (id: string): Promise<Address> => {
    const response = await axios.get(`/api/addresses/${id}`);
    return response.data.address;
  },

  // Create new address
  create: async (data: CreateAddressData): Promise<Address> => {
    const response = await axios.post('/api/addresses', data);
    return response.data.address;
  },

  // Update address
  update: async (id: string, data: UpdateAddressData): Promise<Address> => {
    const response = await axios.put(`/api/addresses/${id}`, data);
    return response.data.address;
  },

  // Delete address
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/api/addresses/${id}`);
  },

  // Select address (set as selected)
  select: async (id: string): Promise<Address> => {
    const response = await axios.patch(`/api/addresses/${id}/select`);
    return response.data.address;
  },
};

