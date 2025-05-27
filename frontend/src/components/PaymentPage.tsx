// frontend/src/components/PaymentPage.tsx - DISEÑO MASTERCOOK ACADEMY MEJORADO
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';
import Navbar from './Navbar';
import './estilos/payment.css';

interface PaymentData {
  bookingId?: number;
  workshopId?: number;
  workshopTitle?: string;
  amount?: number;
  userEmail?: string;
}

const PaymentPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Datos del pago desde la navegación
  const paymentData: PaymentData = location.state || {};
  
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: user?.name || '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'credit_card'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Validar que tenemos los datos necesarios
  useEffect(() => {
    if (!paymentData.workshopId || !paymentData.amount) {
      console.error('❌ [PAYMENT] Datos de pago incompletos:', paymentData);
      navigate('/bookings', { 
        state: { error: 'Datos de pago incompletos. Intenta desde "Mis Reservas".' }
      });
    }
  }, [paymentData, navigate]);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(price);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Formatear fecha de expiración
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Manejar entrada de tarjeta
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  // Manejar entrada de fecha
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData(prev => ({ ...prev, expiryDate: formatted }));
    if (errors.expiryDate) {
      setErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }

    if (!formData.cardHolder || formData.cardHolder.length < 2) {
      newErrors.cardHolder = 'Nombre del titular requerido';
    }

    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Fecha inválida (MM/YY)';
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar pago
  const processPayment = async () => {
    if (!validateForm()) return;

    try {
      setStep('processing');
      console.log('💳 [PAYMENT] Procesando pago...', paymentData);

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 3000));

      const paymentRequest = {
        user_email: user?.email || paymentData.userEmail || '',
        workshop_id: paymentData.workshopId || 0,
        amount: paymentData.amount || 0,
        payment_method: formData.paymentMethod,
        card_number: formData.cardNumber.replace(/\s/g, ''),
        card_holder: formData.cardHolder,
        expiry_date: formData.expiryDate,
        cvv: formData.cvv
      };

      const result = await paymentService.processPayment(paymentRequest);
      setPaymentResult(result);

      if (result.status === 'approved') {
        setStep('success');
        console.log('✅ [PAYMENT] Pago exitoso:', result);
      } else {
        setStep('error');
        console.log('❌ [PAYMENT] Pago fallido:', result);
      }

    } catch (error: any) {
    // Si el error incluye "cannot connect to", mostramos mensaje divertido
    const errorMsg = error.message && error.message.includes('500')
      ? 'Error al conectar con el servidor. El chef encargado de los pagos está en huelga. Estamos negociando con croissants.'
      : (error.message || 'Error inesperado al procesar el pago');
    setPaymentResult({
      status: 'error',
      message: errorMsg
    });
     setStep('error');
   }
  };

  // Determinar el tipo de tarjeta
  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5')) return 'Mastercard';
    if (num.startsWith('3')) return 'American Express';
    return 'Tarjeta';
  };

  // Renderizar formulario de pago
  const renderPaymentForm = () => (
    <>
      {/* Resumen del pago */}
      <div className="payment-form-section">
        <h2 className="payment-section-title">
          📋 Resumen del Pago
        </h2>
        <div className="payment-summary">
          <h3 className="payment-summary-title">Detalles de tu compra</h3>
          <div className="payment-summary-details">
            <div className="payment-summary-item">
              <span className="payment-summary-label">🍳 Taller:</span>
              <span className="payment-summary-value">{paymentData.workshopTitle}</span>
            </div>
            <div className="payment-summary-item">
              <span className="payment-summary-label">👤 Participante:</span>
              <span className="payment-summary-value">{user?.name} ({user?.email})</span>
            </div>
            <div className="payment-summary-item">
              <span className="payment-summary-label">#️⃣ Reserva:</span>
              <span className="payment-summary-value">#{paymentData.bookingId}</span>
            </div>
            <div className="payment-summary-item payment-summary-total">
              <span className="payment-summary-label">💰 Total a pagar:</span>
              <span className="payment-summary-value">{formatPrice(paymentData.amount || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="payment-form-section">
        <h2 className="payment-section-title">
          💳 Método de Pago
        </h2>
        <div className="payment-methods">
          <div className="payment-methods-grid">
            <div className="payment-method-option">
              <input
                type="radio"
                id="credit_card"
                name="paymentMethod"
                value="credit_card"
                checked={formData.paymentMethod === 'credit_card'}
                onChange={handleInputChange}
                className="payment-method-input"
              />
              <label htmlFor="credit_card" className="payment-method-label">
                <svg className="payment-method-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Tarjeta de Crédito</span>
              </label>
            </div>

           
          </div>
        </div>
      </div>

      {/* Formulario de tarjeta */}
      {formData.paymentMethod === 'credit_card' && (
        <div className="payment-form-section">
          <h2 className="payment-section-title">
            🔒 Información de la Tarjeta
          </h2>
          <div className="payment-form-grid">
            {/* Número de tarjeta */}
            <div className="payment-form-field">
              <label className="payment-form-label">
                Número de Tarjeta
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="payment-form-input"
                />
                {formData.cardNumber && (
                  <div className="payment-card-type">
                    {getCardType(formData.cardNumber)}
                  </div>
                )}
              </div>
              {errors.cardNumber && (
                <div className="payment-form-error">{errors.cardNumber}</div>
              )}
            </div>

            {/* Titular */}
            <div className="payment-form-field">
              <label className="payment-form-label">
                Nombre del Titular
              </label>
              <input
                type="text"
                name="cardHolder"
                value={formData.cardHolder}
                onChange={handleInputChange}
                placeholder="Como aparece en la tarjeta"
                className="payment-form-input"
              />
              {errors.cardHolder && (
                <div className="payment-form-error">{errors.cardHolder}</div>
              )}
            </div>

            {/* Fecha y CVV */}
            <div className="payment-form-row two-columns">
              <div className="payment-form-field">
                <label className="payment-form-label">
                  Fecha de Vencimiento
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleExpiryDateChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="payment-form-input"
                />
                {errors.expiryDate && (
                  <div className="payment-form-error">{errors.expiryDate}</div>
                )}
              </div>

              <div className="payment-form-field">
                <label className="payment-form-label">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength={3}
                  className="payment-form-input"
                />
                {errors.cvv && (
                  <div className="payment-form-error">{errors.cvv}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Mock */}
      
      {/* Botones de acción */}
      <div className="payment-actions">
        <button
          onClick={() => navigate('/bookings')}
          className="payment-button payment-button-cancel"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Cancelar
        </button>
        <button
          onClick={processPayment}
          className="payment-button payment-button-pay"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
          </svg>
          Pagar {formatPrice(paymentData.amount || 0)}
        </button>
      </div>

      {/* Información de seguridad */}
      <div className="payment-security-info">
        <div className="payment-security-content">
          <svg className="payment-security-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="payment-security-text">
            <strong>Pago 100% seguro:</strong> Tus datos están protegidos con encriptación SSL de nivel bancario
          </p>
        </div>
      </div>
    </>
  );

  // Renderizar estado de procesamiento
  const renderProcessing = () => (
    <div className="payment-processing">
      <div className="payment-processing-spinner"></div>
      <h3 className="payment-processing-title">Procesando tu pago...</h3>
      <p className="payment-processing-subtitle">
        Por favor no cierres esta ventana ni actualices la página
      </p>
      <div className="payment-processing-progress">
        <div className="payment-processing-progress-fill"></div>
      </div>
    </div>
  );

  // Renderizar resultado exitoso
  const renderSuccess = () => (
    <div className="payment-result payment-result-success">
      <div className="payment-result-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '2rem', height: '2rem' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="payment-result-title">¡Pago Exitoso!</h3>
      <p className="payment-result-message">Tu pago ha sido procesado correctamente</p>
      
      <div className="payment-result-details">
        <h4 className="payment-result-details-title">Detalles del Pago</h4>
        <div className="payment-summary-details">
          <div className="payment-summary-item">
            <span className="payment-summary-label">🔢 ID Transacción:</span>
            <span className="payment-summary-value">{paymentResult?.transaction_id}</span>
          </div>
          <div className="payment-summary-item">
            <span className="payment-summary-label">🍳 Taller:</span>
            <span className="payment-summary-value">{paymentData.workshopTitle}</span>
          </div>
          <div className="payment-summary-item">
            <span className="payment-summary-label">💰 Monto:</span>
            <span className="payment-summary-value">{formatPrice(paymentData.amount || 0)}</span>
          </div>
          <div className="payment-summary-item">
            <span className="payment-summary-label">📊 Estado:</span>
            <span className="payment-summary-value" style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>Pagado ✅</span>
          </div>
        </div>
      </div>

      <div className="payment-result-actions">
        <button
          onClick={() => navigate('/bookings')}
          className="payment-result-button payment-result-button-primary"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Ver Mis Reservas
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="payment-result-button payment-result-button-secondary"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
          Ir al Dashboard
        </button>
      </div>
    </div>
  );

  // Renderizar error
  const renderError = () => (
    <div className="payment-result payment-result-error">
      <div className="payment-result-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '2rem', height: '2rem' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h3 className="payment-result-title">Error en el Pago</h3>
      <p className="payment-result-message">
        {paymentResult?.message || 'No se pudo procesar tu pago'}
      </p>
      
      <div className="payment-result-actions">
        <button
          onClick={() => setStep('form')}
          className="payment-result-button payment-result-button-primary"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Intentar de Nuevo
        </button>
        <button
          onClick={() => navigate('/bookings')}
          className="payment-result-button payment-result-button-secondary"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Reservas
        </button>
      </div>
    </div>
  );

  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (step) {
      case 'form':
        return renderPaymentForm();
      case 'processing':
        return renderProcessing();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return null;
    }
  };

  return (
    <div className="payment-page-container">
      <Navbar />
      
      {/* Header */}
      <div className="payment-page-header">
        <div className="payment-page-header-content">
          <h1 className="payment-page-header-title">
            Procesar Pago
          </h1>
          <div className="payment-page-header-user">
            <span>👤</span>
            <span className="payment-page-user-name">{user?.name}</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="payment-page-main">
        <div className="payment-page-card">
          {renderCurrentStep()}
        </div>

        {/* Información de debug (solo en formulario) */}
        {step === 'form' && (
          <div className="payment-debug-info">
            <h3 className="payment-debug-title">
              ℹ️ Información sobre el simulador de pagos
            </h3>
            <div className="payment-debug-list">
              <div>• Este es un simulador de pagos - No se procesarán pagos reales</div>
              <div>• Usa cualquier número de tarjeta para probar (ej: 4111 1111 1111 1111)</div>
              <div>• Tarjetas terminadas en 0000 simularán pagos fallidos</div>
              <div>• El pago quedará registrado en tu historial de reservas</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;