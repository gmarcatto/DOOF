import { useState, useEffect, useRef } from 'react';
import '../styles/OTPVerification.css';

interface OTPVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  error?: string;
  loading?: boolean;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerify,
  onResend,
  onBack,
  error,
  loading = false,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Para Email Link Authentication, sempre mostrar a tela de espera (não há código para digitar)
  const waitingForLink = true;

  useEffect(() => {
    // Focar no primeiro input
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Apenas um dígito por input

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Mover para o próximo input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit quando todos os dígitos estiverem preenchidos
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setCode(newCode);
    
    // Focar no último input preenchido ou no próximo vazio
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
    
    // Auto-submit se tiver 6 dígitos
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeToVerify?: string) => {
    const codeString = codeToVerify || code.join('');
    if (codeString.length === 6) {
      await onVerify(codeString);
    }
  };

  const handleResend = async () => {
    if (resendCooldown === 0) {
      setResendCooldown(60); // 60 segundos de cooldown
      await onResend();
    }
  };

  // Se estamos esperando pelo link do email (não há código para digitar)
  if (waitingForLink) {
    return (
      <div className="otp-verification">
        <div className="otp-header">
          <button onClick={onBack} className="btn-back-otp" type="button">
            ← Voltar
          </button>
          <h2>Verificar Email</h2>
          <p className="otp-subtitle">
            Um link de autenticação foi enviado para
            <br />
            <strong>{email}</strong>
          </p>
        </div>

        {error && <div className="otp-error">{error}</div>}

        <div style={{
          background: '#f0fff4',
          border: '1px solid #c6f6d5',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
          <h3 style={{ color: '#22543d', marginBottom: '12px' }}>Verifique seu email</h3>
          <p style={{ color: '#22543d', lineHeight: '1.6', marginBottom: '16px' }}>
            Clique no link que enviamos para <strong>{email}</strong> para fazer login.
            <br />
            O link será aberto automaticamente nesta página.
          </p>
          <p style={{ color: '#22543d', fontSize: '0.9rem' }}>
            Não recebeu o email? Verifique sua pasta de spam.
          </p>
        </div>

        <div className="otp-actions">
          <button
            onClick={handleResend}
            className="btn-resend-otp"
            disabled={resendCooldown > 0 || loading}
            type="button"
          >
            {resendCooldown > 0
              ? `Reenviar link em ${resendCooldown}s`
              : 'Reenviar link'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-verification">
      <div className="otp-header">
        <button onClick={onBack} className="btn-back-otp" type="button">
          ← Voltar
        </button>
        <h2>Verificar Código</h2>
        <p className="otp-subtitle">
          Digite o código de 6 dígitos enviado para
          <br />
          <strong>{email}</strong>
        </p>
      </div>

      {error && <div className="otp-error">{error}</div>}

      <div className="otp-inputs-container">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`otp-input ${error ? 'error' : ''}`}
            disabled={loading}
            autoFocus={index === 0}
          />
        ))}
      </div>

      <div className="otp-actions">
        <button
          onClick={() => handleSubmit()}
          className="btn-verify-otp"
          disabled={loading || code.some(digit => !digit)}
          type="button"
        >
          {loading ? 'Verificando...' : 'Verificar Código'}
        </button>

        <button
          onClick={handleResend}
          className="btn-resend-otp"
          disabled={resendCooldown > 0 || loading}
          type="button"
        >
          {resendCooldown > 0
            ? `Reenviar código em ${resendCooldown}s`
            : 'Reenviar código'}
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;

