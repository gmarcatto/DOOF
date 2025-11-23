import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    _id?: string; // Para compatibilidade
    name: string;
    email: string;
    role: string;
    phone?: string;
    avatar?: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Normalizar user.id para _id para compatibilidade
    const normalizedUser = {
      ...user,
      _id: user.id || user._id,
    };
    
    // Salvar token e usuário no AsyncStorage
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
    
    return { token, user: normalizedUser };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao fazer login');
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data;
    
    // Normalizar user.id para _id para compatibilidade
    const normalizedUser = {
      ...user,
      _id: user.id || user._id,
    };
    
    // Salvar token e usuário no AsyncStorage
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
    
    return { token, user: normalizedUser };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao registrar');
  }
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
};

export const getStoredAuth = async (): Promise<AuthResponse | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const userStr = await AsyncStorage.getItem('user');
    
    if (token && userStr) {
      return {
        token,
        user: JSON.parse(userStr),
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getProfile = async (): Promise<any> => {
  try {
    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao buscar perfil');
  }
};

