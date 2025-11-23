import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Invoice.css';

interface Invoice {
  orderNumber: string;
  orderId: string;
  orderDate: string;
  orderStatus: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string | null;
    address: any;
  };
  restaurant: {
    name: string;
    email: string;
    phone: string;
    cnpj: string | null;
    address: any;
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes: string | null;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentMethodLabel: string;
  deliveryType: string;
  deliveryAddress: any;
  pickupAddress: any;
  estimatedDeliveryTime: string;
  statusHistory: any[];
}

const Invoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/orders/${id}/invoice`);
      setInvoice(response.data.invoice);
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      setError(err.response?.data?.error || 'Erro ao carregar nota fiscal');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: any, includeZipCode: boolean = true) => {
    if (!address) return 'Não informado';
    
    const parts = [];
    if (address.street && address.number) {
      parts.push(`${address.street}, ${address.number}`);
    }
    if (address.complement) {
      parts.push(address.complement);
    }
    if (address.neighborhood) {
      parts.push(address.neighborhood);
    }
    if (address.city && address.state) {
      parts.push(`${address.city} - ${address.state}`);
    }
    if (includeZipCode && address.zipCode) {
      parts.push(`CEP: ${address.zipCode}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Não informado';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Aguardando',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Pronto',
      in_delivery: 'Em entrega',
      delivered: 'Entregue',
      picked_up: 'Retirado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="page">
        <Header />
        <div className="loading">Carregando nota fiscal...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Header />
        <div className="invoice-error">
          <h2>Erro ao carregar nota fiscal</h2>
          <p>{error}</p>
          <Link to="/orders" className="btn-back">← Voltar para Pedidos</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="page">
        <Header />
        <div className="invoice-error">
          <h2>Nota fiscal não encontrada</h2>
          <Link to="/orders" className="btn-back">← Voltar para Pedidos</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      
      <main className="invoice-page">
        <div className="container">
          <div className="invoice-header">
            <h1>📄 Nota Fiscal</h1>
            <div className="invoice-actions">
              <button onClick={() => window.print()} className="btn-print">
                🖨️ Imprimir
              </button>
              <Link to={`/orders/${id}`} className="btn-back">
                ← Voltar para Pedido
              </Link>
            </div>
          </div>

          <div className="invoice-document">
            {/* Header da NF */}
            <div className="invoice-doc-header">
              <div className="invoice-title">
                <h2>NOTA FISCAL</h2>
                <p className="invoice-subtitle">Documento Fiscal - DOOF</p>
              </div>
              <div className="invoice-order-info">
                <p><strong>Número do Pedido:</strong> {invoice.orderNumber}</p>
                <p><strong>Data/Hora:</strong> {formatDate(invoice.orderDate)}</p>
              </div>
            </div>

            {/* Dados do Restaurante */}
            <div className="invoice-section">
              <h3>🏪 Dados do Estabelecimento</h3>
              <div className="invoice-info-grid">
                <div>
                  <p><strong>Nome:</strong> {invoice.restaurant.name}</p>
                  <p><strong>Telefone:</strong> {invoice.restaurant.phone}</p>
                  <p><strong>E-mail:</strong> {invoice.restaurant.email}</p>
                  {invoice.restaurant.cnpj && (
                    <p><strong>CNPJ:</strong> {invoice.restaurant.cnpj}</p>
                  )}
                </div>
                <div>
                  <p><strong>Endereço:</strong></p>
                  <p>{formatAddress(invoice.restaurant.address)}</p>
                </div>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="invoice-section">
              <h3>👤 Dados do Cliente</h3>
              <div className="invoice-info-grid">
                <div>
                  <p><strong>Nome:</strong> {invoice.customer.name}</p>
                  <p><strong>E-mail:</strong> {invoice.customer.email}</p>
                  <p><strong>Telefone:</strong> {invoice.customer.phone}</p>
                  {invoice.customer.cpf && (
                    <p><strong>CPF:</strong> {invoice.customer.cpf}</p>
                  )}
                </div>
                <div>
                  <p><strong>Endereço de {invoice.deliveryType === 'delivery' ? 'Entrega' : 'Cobrança'}:</strong></p>
                  <p>{formatAddress(invoice.customer.address, false)}</p>
                </div>
              </div>
            </div>

            {/* Itens do Pedido */}
            <div className="invoice-section">
              <h3>🛒 Itens do Pedido</h3>
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantidade</th>
                    <th>Preço Unitário</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div>
                          <strong>{item.name}</strong>
                          {item.notes && (
                            <p className="item-notes">Obs: {item.notes}</p>
                          )}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>R$ {item.unitPrice.toFixed(2)}</td>
                      <td>R$ {item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totais */}
            <div className="invoice-section">
              <h3>💰 Resumo Financeiro</h3>
              <div className="invoice-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>R$ {invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.deliveryFee > 0 && (
                  <div className="total-row">
                    <span>Taxa de Entrega:</span>
                    <span>R$ {invoice.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="total-row discount">
                    <span>Desconto:</span>
                    <span>- R$ {invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-row final-total">
                  <span><strong>TOTAL:</strong></span>
                  <span><strong>R$ {invoice.total.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="invoice-section">
              <h3>💳 Forma de Pagamento</h3>
              <p><strong>{invoice.paymentMethodLabel}</strong></p>
            </div>

            {/* Informações de Entrega */}
            {invoice.deliveryType === 'delivery' && invoice.deliveryAddress && (
              <div className="invoice-section">
                <h3>🚚 Informações de Entrega</h3>
                <p><strong>Tipo:</strong> Entrega</p>
                <p><strong>Endereço:</strong> {formatAddress(invoice.deliveryAddress, false)}</p>
                <p><strong>Previsão de Entrega:</strong> {formatDate(invoice.estimatedDeliveryTime)}</p>
              </div>
            )}

            {invoice.deliveryType === 'pickup' && invoice.pickupAddress && (
              <div className="invoice-section">
                <h3>🏪 Informações de Retirada</h3>
                <p><strong>Tipo:</strong> Retirada no Local</p>
                <p><strong>Local:</strong> {invoice.pickupAddress.restaurantAddress}</p>
                {invoice.pickupAddress.instructions && (
                  <p><strong>Instruções:</strong> {invoice.pickupAddress.instructions}</p>
                )}
                <p><strong>Previsão de Retirada:</strong> {formatDate(invoice.estimatedDeliveryTime)}</p>
              </div>
            )}

            {/* Rodapé da NF */}
            <div className="invoice-footer">
              <p className="invoice-disclaimer">
                <strong>Observações:</strong> Esta é uma nota fiscal informativa gerada pelo sistema DOOF.
                Este documento não substitui a Nota Fiscal Eletrônica (NF-e) oficial quando exigida por lei.
              </p>
              <p className="invoice-date">
                Documento gerado em: {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Invoice;

