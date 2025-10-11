import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('🔵 AuthCallback - Token recebido:', token ? 'SIM' : 'NÃO');
    console.log('🔵 Token completo:', token);

    if (token) {
      console.log('✅ Salvando token no localStorage');
      localStorage.setItem('token', token);
      
      // Configurar axios com o token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('🔵 Redirecionando para home');
      
      // Usar replace para forçar recarga completa
      window.location.href = '/';
    } else {
      console.log('❌ Nenhum token encontrado, voltando para login');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div>Autenticando com Google...</div>
      <div style={{ fontSize: '2rem' }}>🔄</div>
    </div>
  );
};

export default AuthCallback;

