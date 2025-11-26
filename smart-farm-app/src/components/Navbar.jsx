import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.body.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-dark-green flex items-center gap-2">
          <i className="fas fa-leaf"></i> Smart Farm
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-primary-green font-medium">{t('nav.marketplace')}</Link>
          
          {/* Only show these if logged in with appropriate role - actually user requested separate frontends */}
          {/* So if I am logged in as Farmer, I should see Dashboard link */}
          {user && user.role === 'farmer' && (
            <Link to="/farmer" className="text-gray-700 hover:text-primary-green font-medium">{t('nav.dashboard')}</Link>
          )}
          {user && user.role === 'advisor' && (
            <Link to="/advisor" className="text-gray-700 hover:text-primary-green font-medium">{t('nav.dashboard')}</Link>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin" className="text-gray-700 hover:text-primary-green font-medium">{t('nav.dashboard')}</Link>
          )}

          <div className="flex items-center gap-2 border-l pl-4 ml-2">
            <button onClick={() => changeLanguage('en')} className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-light-green text-dark-green' : 'text-gray-600'}`}>EN</button>
            <button onClick={() => changeLanguage('fr')} className={`px-2 py-1 rounded ${i18n.language === 'fr' ? 'bg-light-green text-dark-green' : 'text-gray-600'}`}>FR</button>
            <button onClick={() => changeLanguage('ar')} className={`px-2 py-1 rounded ${i18n.language === 'ar' ? 'bg-light-green text-dark-green' : 'text-gray-600'}`}>AR</button>
          </div>

          {user ? (
            <div className="flex items-center gap-4 ml-4">
              <span className="text-gray-600 font-medium">{user.name}</span>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-primary-green text-white px-4 py-2 rounded hover:bg-dark-green transition ml-4">
              {t('nav.login')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;