import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <Header />
      
      <main className="home">
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">Bem-vindo ao Doof! 🍔</h1>
            <p className="hero-subtitle">
              A melhor plataforma de delivery de comida. Peça agora e receba em casa!
            </p>
            <div className="hero-buttons">
              <Link to="/restaurants" className="btn-hero">
                Ver Restaurantes
              </Link>
              {user && (
                <Link to="/addresses" className="btn-hero btn-addresses">
                  📍 Meus Endereços
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h2>Por que escolher o Doof?</h2>
            
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3>Entrega Rápida</h3>
                <p>Receba seus pedidos em tempo recorde</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🍕</div>
                <h3>Variedade</h3>
                <p>Centenas de restaurantes e milhares de pratos</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3>Pagamento Fácil</h3>
                <p>Pague com cartão, PIX ou dinheiro</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Acompanhamento</h3>
                <p>Veja seu pedido em tempo real</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container">
            <h2>Comece agora!</h2>
            <p>Cadastre-se e faça seu primeiro pedido</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary">Criar Conta</Link>
              <Link to="/restaurants" className="btn-secondary">Explorar Restaurantes</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;




