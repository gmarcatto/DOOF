import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendOTP, verifyOTP, getFirebaseIdToken } from '../services/firebaseAuthService';
import { saveUserToBackend } from '../services/userService';
import OTPVerification from '../components/OTPVerification';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Auth.css';

const LoginOTP: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithFirebase } = useAuth();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Validação de telefone brasileiro
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    if (!phone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }

    const phoneNumbers = phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      setError('Telefone inválido. Digite pelo menos 10 dígitos');
      return false;
    }

    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return false;
    }

    return true;
  };

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Salvar email e dados do usuário no localStorage (requisito do Firebase Email Link)
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('userName', name);
      window.localStorage.setItem('userPhone', phone);
      
      const result = await sendOTP(email);
      
      if (result.success) {
        setOtpSent(true);
        setStep('otp'); // Mudar para tela de verificação
        setError(''); // Limpar erros
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar link. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar se estamos na página de verificação de email (callback do Firebase)
  useEffect(() => {
    const checkEmailLink = async () => {
      const currentUrl = window.location.href;
      const urlParams = new URLSearchParams(window.location.search);
      const emailFromUrl = urlParams.get('email');
      
      console.log('Verificando URL:', currentUrl);
      console.log('Email da URL:', emailFromUrl);
      
      // Verificar se a URL contém parâmetros do Firebase Email Link
      // O Firebase adiciona parâmetros como: mode=signIn, oobCode, apiKey, etc.
      const hasFirebaseParams = 
        currentUrl.includes('mode=signIn') || 
        currentUrl.includes('oobCode=') || 
        currentUrl.includes('apiKey=') ||
        urlParams.has('oobCode');
      
      if (hasFirebaseParams) {
        const emailToUse = emailFromUrl || window.localStorage.getItem('emailForSignIn') || email;
        console.log('Email a usar:', emailToUse);
        
        if (emailToUse) {
          setEmail(emailToUse);
          setStep('otp');
          // Aguardar um pouco para garantir que o estado foi atualizado
          setTimeout(() => {
            handleVerifyEmailLink();
          }, 100);
        } else {
          setError('Email não encontrado. Por favor, solicite um novo link.');
        }
      }
    };

    checkEmailLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerifyEmailLink = async () => {
    setError('');
    setLoading(true);

    try {
      const emailToUse = email || window.localStorage.getItem('emailForSignIn') || '';
      
      console.log('handleVerifyEmailLink - Email:', emailToUse);
      console.log('handleVerifyEmailLink - URL:', window.location.href);
      
      if (!emailToUse) {
        setError('Email não encontrado. Solicite um novo link.');
        setLoading(false);
        return;
      }

      // Verificar o link do email (passar a URL completa)
      const result = await verifyOTP(emailToUse, window.location.href);

      if (result.success && result.user) {
        console.log('Link verificado com sucesso!');
        
        // Obter token do Firebase
        const firebaseToken = await getFirebaseIdToken();
        
        if (firebaseToken) {
          // Buscar dados do usuário do localStorage ou usar dados do formulário
          // Se não tiver nome/telefone no estado, tentar buscar do localStorage
          const savedName = name || window.localStorage.getItem('userName') || result.user.displayName || 'Usuário';
          const savedPhone = phone || window.localStorage.getItem('userPhone') || '';
          
          console.log('Salvando usuário no backend:', { name: savedName, email: emailToUse, phone: savedPhone });
          
          // Salvar usuário no backend
          const backendResponse = await saveUserToBackend(firebaseToken, {
            name: savedName,
            email: emailToUse,
            phone: savedPhone.replace(/\D/g, ''),
            firebaseUid: result.user.uid,
          });

          console.log('Usuário salvo no backend:', backendResponse.user);

          // Fazer login no contexto
          await loginWithFirebase(backendResponse.token, backendResponse.user);

          // Limpar localStorage
          window.localStorage.removeItem('emailForSignIn');
          window.localStorage.removeItem('userName');
          window.localStorage.removeItem('userPhone');

          // Redirecionar
          navigate('/');
        } else {
          setError('Erro ao obter token de autenticação');
        }
      } else {
        console.error('Erro ao verificar link:', result.error);
        setError(result.error || 'Link inválido ou expirado. Solicite um novo link.');
      }
    } catch (err: any) {
      console.error('Error verifying email link:', err);
      setError(err.message || 'Erro ao verificar link. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    // Esta função não será usada com Email Link, mas mantemos para compatibilidade
    // O código será verificado automaticamente quando o usuário clicar no link do email
    setError('Por favor, clique no link enviado para seu email para fazer login.');
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await sendOTP(email);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar código.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="page">
        <Header />
        <main className="auth-page">
          <div className="auth-container">
            <div className="auth-card">
              <OTPVerification
                email={email}
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={() => {
                  setStep('form');
                  setOtpSent(false);
                }}
                error={error}
                loading={loading}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h1>Entrar com Email</h1>
            <p className="auth-subtitle">Receba um código por email para fazer login</p>

            {error && <div className="error-message">{error}</div>}
            {otpSent && (
              <div className="success-message" style={{
                background: '#f0fff4',
                border: '1px solid #c6f6d5',
                color: '#22543d',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>✅</div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Link enviado para seu email!</div>
                <div style={{ fontSize: '0.9rem' }}>
                  Verifique sua caixa de entrada e clique no link para fazer login.
                  <br />
                  O link será aberto nesta página automaticamente.
                </div>
              </div>
            )}

            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Nome Completo *</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefone *</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Código'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginOTP;

