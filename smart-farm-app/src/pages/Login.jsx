import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const user = await login(email, password);
    if (user) {
      if (user.role === 'farmer') navigate('/farmer');
      else if (user.role === 'advisor') navigate('/advisor');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } else {
      setError(t('auth.invalidCredentials'));
    }
  };

  return (
    <div className="min-h-screen bg-primary-green flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        <div className="mb-6">
          <i className="fas fa-leaf text-dark-green text-5xl mb-2"></i>
          <h2 className="text-2xl font-bold text-gray-800">{t('auth.loginTitle')}</h2>
          <p className="text-gray-600">{t('auth.accessDashboard')}</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">{t('auth.emailLabel')}</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">{t('auth.passwordLabel')}</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-primary-green text-white py-2 rounded font-bold hover:bg-dark-green transition">{t('auth.loginBtn')}</button>
        </form>

        <div className="mt-6 text-sm">
          <p>{t('auth.noAccount')}</p>
          <Link to="/register" className="text-primary-green font-bold hover:underline">{t('auth.registerFarmer')}</Link>
        </div>
        <div className="mt-4">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">&larr; {t('auth.backToMarket')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;