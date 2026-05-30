import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    profession: 'farmer'
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t('validation.passwordMismatch'));
      return;
    }

    setLoading(true);
    const user = await register(formData);
    setLoading(false);
    
    if (user) {
      if (user.role === 'farmer') navigate('/farmer');
      else if (user.role === 'buyer') navigate('/buyer');
      else navigate('/');
    } else {
      // Alert is already handled in register function
    }
  };

  return (
    <div className="min-h-screen bg-primary-green dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center">
        <div className="mb-6">
          <i className="fas fa-leaf text-dark-green dark:text-emerald-400 text-5xl mb-2"></i>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('register.title')}</h2>
          <p className="text-gray-600 dark:text-slate-400">{t('auth.noAccount')}</p>
        </div>
        <div className="mb-6 flex gap-2">
          {[
            { value: 'farmer', label: t('register.seller') },
            { value: 'buyer', label: t('register.buyer') }
          ].map((option) => {
            const active = formData.role === option.value;
            return (
              <label
                key={option.value}
                className={`flex items-center justify-center gap-2 flex-1 p-3 border-2 rounded-xl cursor-pointer transition font-medium text-sm ${
                  active
                    ? 'border-primary-green dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-dark-green dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={active}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="accent-emerald-600"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">{t('register.fullName')}</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-primary-green dark:focus:border-emerald-500"
              placeholder={t('register.fullName')}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">{t('buyer.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-primary-green dark:focus:border-emerald-500"
              placeholder={t('buyer.email')}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">{t('buyer.phone')}</label>
            <input 
              type="text" 
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-primary-green dark:focus:border-emerald-500" 
              placeholder="+250 788 123 456" 
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">{t('buyer.location')}</label>
            <input 
              type="text" 
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-primary-green dark:focus:border-emerald-500" 
              placeholder={t('register.locationPlaceholder')} 
              required
            />
          </div>
          {formData.role === 'farmer' && (
            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">{t('buyer.profession')}</label>
              <select
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-primary-green dark:focus:border-emerald-500"
                required
              >
                <option value="">{t('register.selectRole')}</option>
                <option value="farmer">{t('register.farmer')}</option>
                <option value="butcher">{t('register.butcher')}</option>
                <option value="fisher">{t('register.fisher')}</option>
                <option value="baker">{t('register.baker')}</option>
                <option value="gardener">{t('register.gardener')}</option>
                <option value="other">{t('register.other')}</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">{t('register.password')}</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-primary-green dark:focus:border-emerald-500" 
              placeholder={t('register.password')} 
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">{t('register.confirmPassword')}</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-primary-green dark:focus:border-emerald-500" 
              placeholder={t('register.confirmPassword')} 
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="terms" className="rounded accent-emerald-600 focus:ring-primary-green" required />
            <label htmlFor="terms" className="text-sm text-gray-700 dark:text-slate-300">{t('auth.noAccount')}</label>
          </div>
                    <button 
            type="submit" 
            className={`w-full bg-primary-green text-white py-2.5 rounded-lg font-bold hover:bg-dark-green transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('register.registerBtn')}
          </button>
        </form>
        <div className="mt-6 text-sm text-gray-700 dark:text-slate-300">
          <p>{t('register.alreadyAccount')}</p>
          <Link to="/login" className="text-primary-green dark:text-emerald-400 font-bold hover:underline">{t('register.loginHere')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;