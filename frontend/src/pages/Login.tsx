import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <div className="page">
      <Header />
      
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h1>Entrar no Doof</h1>
            <p className="auth-subtitle">Faça login para continuar</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="auth-divider">
              <span>ou</span>
            </div>

            <div className="oauth-buttons">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="btn-oauth btn-google"
              >
                <span>🔍</span> Entrar com Google
              </button>
              <button
                onClick={() => navigate('/login/otp')}
                className="btn-oauth btn-firebase"
                style={{
                  background: '#FF6B35',
                  color: 'white',
                  border: 'none',
                }}
              >
                <span>📧</span> Entrar com Email (Firebase)
              </button>
            </div>

            <p className="auth-footer">
              Não tem uma conta? <Link to="/register">Cadastre-se</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;

