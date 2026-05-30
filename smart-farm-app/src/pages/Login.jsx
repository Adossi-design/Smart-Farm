import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result?.success) {
      success(t('auth.loginSuccess') || 'Login successful');
      const user = result.user;
      if (user.role === 'farmer') navigate('/seller');
      else if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'buyer') navigate('/buyer');
      else navigate('/');
    } else {
      error(result?.message || t('auth.invalidCredentials'));
    }
  };

  return (
    <div className="min-h-screen bg-primary-green dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <div className="mb-6">
          <i className="fas fa-leaf text-dark-green dark:text-emerald-400 text-5xl mb-2"></i>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('auth.loginTitle')}</h2>
          <p className="text-gray-600 dark:text-slate-400">{t('auth.accessDashboard')}</p>
        </div>

        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">{t('auth.emailLabel')}</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-primary-green dark:focus:border-emerald-500"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">{t('auth.passwordLabel')}</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-primary-green dark:focus:border-emerald-500"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-green text-white py-2.5 rounded-lg font-bold hover:bg-dark-green transition disabled:opacity-60">
            {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>{t('common.loading')}</> : t('auth.loginBtn')}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-700 dark:text-slate-300">
          <p>{t('auth.noAccount')}</p>
          <Link to="/register" className="text-primary-green dark:text-emerald-400 font-bold hover:underline">{t('auth.registerSeller')}</Link>
        </div>
        <div className="mt-4">
          <Link to="/" className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 text-sm">&larr; {t('auth.backToMarket')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;