import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🍔 Doof</h3>
            <p>Seu delivery de comida favorito</p>
          </div>
          
          <div className="footer-section">
            <h4>Links Rápidos</h4>
            <ul>
              <li><a href="/restaurants">Restaurantes</a></li>
              <li><a href="/about">Sobre</a></li>
              <li><a href="/contact">Contato</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Para Restaurantes</h4>
            <ul>
              <li><a href="/register?role=restaurant">Cadastre seu restaurante</a></li>
              <li><a href="/restaurant/dashboard">Painel do Restaurante</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Redes Sociais</h4>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="Twitter">🐦</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Doof. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;




