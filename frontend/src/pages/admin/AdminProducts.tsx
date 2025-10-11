import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/Admin.css';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  restaurant: any;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir produto');
    }
  };

  const filteredProducts = filter
    ? products.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.restaurant.name.toLowerCase().includes(filter.toLowerCase())
      )
    : products;

  return (
    <div className="page">
      <Header />
      
      <main className="admin-page">
        <div className="container">
          <div className="admin-header">
            <h1>Gerenciar Produtos</h1>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Restaurante</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.restaurant.name}</td>
                      <td>{product.category}</td>
                      <td>R$ {product.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${product.available ? 'badge-success' : 'badge-error'}`}>
                          {product.available ? 'Disponível' : 'Indisponível'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="btn-action btn-delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminProducts;




