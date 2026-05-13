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
    <div className="min-h-screen bg-primary-green flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg text-center">
        <div className="mb-6">
          <i className="fas fa-leaf text-dark-green text-5xl mb-2"></i>
          <h2 className="text-2xl font-bold text-gray-800">{t('register.title')}</h2>
          <p className="text-gray-600">{t('auth.noAccount')}</p>
        </div>
        <div className="mb-6 flex gap-2">
          <label className="flex items-center gap-2 flex-1 p-3 border rounded cursor-pointer" style={{ borderColor: formData.role === 'farmer' ? '#2d5016' : '#ddd', backgroundColor: formData.role === 'farmer' ? '#f0f9eb' : 'white' }}>
            <input type="radio" name="role" value="farmer" checked={formData.role === 'farmer'} onChange={(e) => setFormData({...formData, role: e.target.value})} />
            <span className="text-sm font-medium">{t('register.seller')}</span>
          </label>
          <label className="flex items-center gap-2 flex-1 p-3 border rounded cursor-pointer" style={{ borderColor: formData.role === 'buyer' ? '#2d5016' : '#ddd', backgroundColor: formData.role === 'buyer' ? '#f0f9eb' : 'white' }}>
            <input type="radio" name="role" value="buyer" checked={formData.role === 'buyer'} onChange={(e) => setFormData({...formData, role: e.target.value})} />
            <span className="text-sm font-medium">{t('register.buyer')}</span>
          </label>
        </div>
        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">{t('register.fullName')}</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green"
              placeholder={t('register.fullName')}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">{t('buyer.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green"
              placeholder={t('buyer.email')}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">{t('buyer.phone')}</label>
            <input 
              type="text" 
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
              placeholder="+250 788 123 456" 
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">{t('buyer.location')}</label>
            <input 
              type="text" 
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
              placeholder={t('register.locationPlaceholder')} 
              required
            />
          </div>
          {formData.role === 'farmer' && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">{t('buyer.profession')}</label>
              <select
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green"
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
            <label className="block text-gray-700 font-medium mb-1">{t('register.password')}</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
              placeholder={t('register.password')} 
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">{t('register.confirmPassword')}</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
              placeholder={t('register.confirmPassword')} 
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="terms" className="rounded text-primary-green focus:ring-primary-green" required />
            <label htmlFor="terms" className="text-sm text-gray-700">{t('auth.noAccount')}</label>
          </div>
                    <button 
            type="submit" 
            className={`w-full bg-primary-green text-white py-2 rounded font-bold hover:bg-dark-green transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('register.registerBtn')}
          </button>
        </form>
        <div className="mt-6 text-sm">
          <p>{t('register.alreadyAccount')}</p>
          <Link to="/login" className="text-primary-green font-bold hover:underline">{t('register.loginHere')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;