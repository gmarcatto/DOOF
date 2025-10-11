import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductsTest: React.FC = () => {
  console.log('ProductsTest component rendered');
  
  return (
    <div className="page">
      <Header />
      
      <main style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1>🍽️ Teste de Produtos</h1>
          <p>Se você está vendo esta mensagem, a página está funcionando!</p>
          <p>Total de produtos: Carregando...</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductsTest;