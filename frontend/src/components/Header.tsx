import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import '../styles/Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>🍔 Doof</h1>
        </Link>

        <nav className="nav">
          <Link to="/restaurants" className="nav-link">Restaurantes</Link>
          <Link to="/products" className="nav-link">Produtos</Link>
          
          {user ? (
            <>
              <Link to="/orders" className="nav-link">Meus Pedidos</Link>
              <Link to="/cart" className="nav-link cart-link">
                🛒 Carrinho
                {cartItemCount > 0 && <span className="badge">{cartItemCount}</span>}
              </Link>
              
              {user.role === 'admin' && (
                <div className="dropdown">
                  <button className="nav-link">Admin</button>
                  <div className="dropdown-menu">
                    <Link to="/admin/users">Usuários</Link>
                    <Link to="/admin/restaurants">Restaurantes</Link>
                    <Link to="/admin/products">Produtos</Link>
                  </div>
                </div>
              )}
              
              {user.role === 'restaurant' && (
                <Link to="/restaurant/dashboard" className="nav-link">Dashboard</Link>
              )}
              
              <div className="dropdown">
                <button className="nav-link">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="avatar" />
                  ) : (
                    <span>👤</span>
                  )}
                  {user.name}
                </button>
                <div className="dropdown-menu">
                  <Link to="/profile">Perfil</Link>
                  <button onClick={handleLogout}>Sair</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Entrar</Link>
              <Link to="/register" className="btn-primary">Cadastrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;


