import axios from 'axios';

export interface UserData {
  name: string;
  email: string;
  phone: string;
  firebaseUid?: string;
}

export interface SaveUserResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
  };
}

/**
 * Salva ou atualiza o usuário no backend após autenticação Firebase
 */
export const saveUserToBackend = async (
  firebaseIdToken: string,
  userData: UserData
): Promise<SaveUserResponse> => {
  try {
    const response = await axios.post('/api/auth/firebase', {
      firebaseIdToken,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      firebaseUid: userData.firebaseUid,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error saving user to backend:', error);
    throw new Error(error.response?.data?.error || 'Erro ao salvar usuário');
  }
};

/**
 * Busca dados do usuário no backend
 */
export const getUserFromBackend = async (userId: string): Promise<any> => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data.user;
  } catch (error: any) {
    console.error('Error fetching user from backend:', error);
    throw new Error(error.response?.data?.error || 'Erro ao buscar usuário');
  }
};




