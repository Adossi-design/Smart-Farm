import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Checkout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const cart = location.state?.cart || [];
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Platform fee: 5% added on top of item prices (goes to admin)
  const platformFee = Math.round(cartTotal * 0.05);
  const totalAmount = cartTotal + platformFee;
  const adminShare = platformFee;
  const sellerShare = cartTotal;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <i className="fas fa-lock text-6xl text-slate-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('checkout.loginRequired')}</h2>
          <p className="text-gray-600 mb-6">{t('checkout.loginPrompt')}</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:from-emerald-600 hover:to-emerald-700 transition"
          >
            {t('checkout.goToLogin')}
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <i className="fas fa-shopping-cart text-6xl text-slate-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('checkout.cartEmpty')}</h2>
          <p className="text-gray-600 mb-6">{t('checkout.cartEmptyPrompt')}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:from-emerald-600 hover:to-emerald-700 transition"
          >
            {t('checkout.continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Credit Card Payment Integration
      if (paymentMethod === 'card') {
        // Call Credit Card Payment API
        console.log('Processing Credit Card payment for:', totalAmount);
        console.log('Admin (platform) share:', adminShare, 'CFA');
        console.log('Seller payout (total of items):', sellerShare, 'CFA');
      }
      // Persist order to backend
      try {
        const token = user?.token;
        const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items: cart, subtotal: cartTotal, platformFee, total: totalAmount, paymentMethod })
        });
        if (!resp.ok) {
          console.warn('Failed to persist order to backend');
        }
      } catch (err) {
        console.warn('Order persistence error:', err);
      }
      
      setOrderPlaced(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Order error:', error);
      alert(t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="mb-6 animate-bounce">
            <i className="fas fa-check-circle text-6xl text-emerald-500"></i>
          </div>
          <h2 className="text-3xl font-bold text-dark-green mb-2">{t('checkout.orderPlacedSuccess')}</h2>
          <p className="text-gray-600 text-lg mb-6">{t('checkout.thankYouRedirecting')}</p>
          <p className="text-emerald-600 font-bold">{t('checkout.orderTotal')}: CFA {totalAmount?.toLocaleString() || '0'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-dark-green mb-8">{t('checkout.checkout')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <h2 className="text-xl font-bold text-dark-green mb-4 flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-emerald-500"></i>
                {t('checkout.deliveryAddress')}
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <input 
                    type="text" 
                    placeholder={t('checkout.city')} 
                    defaultValue={user?.location || user?.city || ''}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-sm text-gray-500">{t('checkout.deliveryNote')}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <h2 className="text-xl font-bold text-dark-green mb-4 flex items-center gap-2">
                <i className="fas fa-box text-emerald-500"></i>
                {t('checkout.orderItems')} ({cart.length})
              </h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b last:border-0">
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">{t('checkout.qty')}: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">CFA {(item.price * item.quantity)?.toLocaleString() || '0'}</p>
                        <p className="text-sm text-gray-600">CFA {item.price?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <h2 className="text-xl font-bold text-dark-green mb-4 flex items-center gap-2">
                <i className="fas fa-credit-card text-emerald-500"></i>
                {t('checkout.paymentMethod')}
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-emerald-500 rounded-lg cursor-pointer bg-emerald-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card" 
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <div className="ml-3">
                    <p className="font-bold text-dark-green">{t('checkout.debitCreditCard')}</p>
                    <p className="text-sm text-gray-600">{t('checkout.secureOnlinePayment')}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Total Summary */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-dark-green mb-6">{t('checkout.orderSummary')}</h2>
            
            <div className="space-y-3 pb-6 border-b-2 border-slate-200">
              <div className="flex justify-between text-gray-600">
                <span>{t('checkout.subtotal')}</span>
                <span>CFA {cartTotal?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('checkout.platformFee')}</span>
                <span>CFA {platformFee?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('checkout.sellerPayout')}</span>
                <span>CFA {sellerShare?.toLocaleString() || '0'}</span>
              </div>
            </div>

            <div className="py-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-dark-green">{t('checkout.total')}</span>
                <span className="text-2xl font-bold text-emerald-600">
                  CFA {totalAmount?.toLocaleString() || '0'}
                </span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-bold hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i>
                  {t('checkout.processing')}
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  {t('checkout.placeOrder')}
                </>
              )}
            </button>

            <button 
              onClick={() => navigate('/')}
              className="w-full mt-3 bg-slate-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-slate-300 transition"
            >
              {t('checkout.continueShopping')}
            </button>

            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800">
                <i className="fas fa-shield-alt mr-2"></i>
                <strong>{t('checkout.secureCheckout')}:</strong> {t('checkout.secureCheckoutDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
