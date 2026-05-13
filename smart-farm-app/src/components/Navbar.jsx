import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { changeAppLanguage } from '../i18n';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const changeLanguage = async (lng) => {
    await changeAppLanguage(lng);
    setShowLangMenu(false);
  };

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' }
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          <Link to="/" className="text-2xl font-bold text-dark-green dark:text-emerald-400 flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-300 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-leaf text-white"></i>
            </div>
            <span>Toumaï</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition">{t('nav.marketplace')}</Link>
            {user ? (
              <>
                <Link to="/buyer" className="text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition">{t('common.messages')}</Link>
                <Link to="/buyer" className="text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition">{t('buyer.bookmarks')}</Link>
                <Link to="/profile" className="text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition">{t('common.profile')}</Link>
              </>
            ) : (
              <>
                <a href="#about" className="text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition">{t('home.aboutTitle') || 'About Us'}</a>
                <a href="#contact" className="text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition">{t('home.contactUs')}</a>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowMobileMenu((current) => !current)}
              className="lg:hidden flex items-center justify-center h-11 w-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              aria-label="Open navigation menu"
              aria-expanded={showMobileMenu}
            >
              <i className={`fas ${showMobileMenu ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-full border border-emerald-200 dark:border-slate-700 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-slate-700 transition"
              aria-label="Toggle theme"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
              <span className="hidden sm:inline">{theme === 'dark' ? t('nav.light') || 'Light' : t('nav.dark') || 'Dark'}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowLangMenu((current) => !current)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition font-medium text-dark-green dark:text-emerald-400"
              >
                <i className="fas fa-globe"></i>
                <span className="text-sm">{languages.find((lang) => lang.code === currentLang)?.label || languages[0].label}</span>
                <i className={`fas fa-chevron-down text-sm transition-transform ${showLangMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {showLangMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 transition ${
                        currentLang === lang.code ? 'bg-emerald-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{lang.label}</span>
                      {currentLang === lang.code && <i className="fas fa-check ml-auto text-emerald-600 dark:text-emerald-400"></i>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((current) => !current)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-700 text-dark-green dark:text-emerald-400 font-medium hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-slate-700 dark:hover:to-slate-600 transition"
                >
                  <i className="fas fa-user-circle text-lg"></i>
                  <span className="hidden sm:inline">{user.name?.split(' ')[0]}</span>
                  <i className={`fas fa-chevron-down text-sm transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50 w-48">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                      <p className="font-bold text-gray-800 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300 capitalize">{user.role} {t('profile.account') || 'Account'}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition flex items-center gap-2"
                    >
                      <i className="fas fa-user"></i>
                      {t('common.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition flex items-center gap-2"
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-4 py-2 rounded-lg text-dark-green dark:text-emerald-400 border-2 border-dark-green dark:border-slate-700 font-medium hover:bg-dark-green dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white transition">
                  {t('auth.loginBtn')}
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 transition">
                  {t('register.registerBtn')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {showMobileMenu && (
          <div className="lg:hidden pb-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-lg">
              <div className="grid grid-cols-2 gap-px bg-slate-200 dark:bg-slate-700">
                {[
                  { label: t('nav.marketplace'), href: '/', icon: 'fa-store' },
                  ...(user
                    ? [
                        { label: t('common.messages'), href: '/chat', icon: 'fa-comments' },
                        { label: t('buyer.bookmarks') || 'Bookmarks', href: '/buyer', icon: 'fa-bookmark' },
                        { label: t('common.profile'), href: '/profile', icon: 'fa-user' },
                      ]
                    : [
                        { label: t('home.aboutTitle') || 'About Us', href: '#about', icon: 'fa-circle-info' },
                        { label: t('home.contactUs'), href: '#contact', icon: 'fa-phone' },
                      ])
                ].map((item) => (
                  item.href.startsWith('#') ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold"
                    >
                      <i className={`fas ${item.icon} text-emerald-500`}></i>
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold"
                    >
                      <i className={`fas ${item.icon} text-emerald-500`}></i>
                      {item.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
