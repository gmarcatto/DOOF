import axios from 'axios';
import { Platform } from 'react-native';

// Função para detectar a URL base da API
const getApiBaseUrl = (): string => {
  // Em produção, usar a URL de produção
  if (!__DEV__) {
    return 'https://your-production-api.com/api';
  }

  // Para Android Emulator, usar 10.0.2.2 que mapeia para localhost do host
  if (Platform.OS === 'android') {
    // 10.0.2.2 é o alias especial do emulador para localhost do host
    return 'http://10.0.2.2:5000/api';
  }

  // Para iOS Simulator, usar localhost
  if (Platform.OS === 'ios') {
    return 'http://localhost:5000/api';
  }

  // Fallback para desenvolvimento
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
