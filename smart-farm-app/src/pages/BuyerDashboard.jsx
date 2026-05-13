import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import ChatList from '../components/ChatList';
import ConversationView from '../components/ConversationView';
import ProfileAvatarPicker from '../components/ProfileAvatarPicker';
import BugReportModal from '../components/BugReportModal';
import LanguageSwitcher from '../components/LanguageSwitcher';

const BuyerDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const { products, bookmarks } = useData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'marketplace');
  const [activeConversationId, setActiveConversationId] = useState(searchParams.get('conversationId') || null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [showBugReport, setShowBugReport] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', location: '',
    profession: '', organization: '', specialization: '', password: ''
  });

  const categories = [
    { id: 'all', label: t('buyer.allCategories') },
    { id: 'vegetables', label: t('buyer.freshVegetables') },
    { id: 'fruits', label: t('buyer.freshFruit') },
    { id: 'meat', label: t('buyer.freshMeat') },
    { id: 'fish', label: t('buyer.freshFish') },
    { id: 'local', label: t('buyer.localFood') }
  ];

  useEffect(() => {
    if (!user?.token) { navigate('/login'); return; }
    setProfileData({
      name: user.name || '', email: user.email || '', phone: user.phone || '',
      location: user.location || '', profession: user.profession || '',
      organization: user.organization || '', specialization: user.specialization || '', password: ''
    });
  }, [user, navigate]);

  // Sync URL params when navigating from ContactButton
  useEffect(() => {
    const tab = searchParams.get('tab');
    const convId = searchParams.get('conversationId');
    if (tab) setActiveTab(tab);
    if (convId) setActiveConversationId(convId);
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'messages') setActiveConversationId(null);
    setSearchParams(tab === 'marketplace' ? {} : { tab });
  };

  const handleSelectConversation = (id) => {
    setActiveConversationId(String(id));
  };

  const handleBackToList = () => {
    setActiveConversationId(null);
  };

  const handleLogout = () => {
    logout();
    success(t('common.loggedOut') || 'Logged out successfully');
    navigate('/');
  };

  const handleProfileInput = (e) => {
    const { name, value } = e.target;
    setProfileData(cur => ({ ...cur, [name]: value }));
  };

  const saveProfile = async () => {
    if (!user?.token) return;
    setSavingProfile(true);
    try {
      const formData = new FormData();
      ['name','email','phone','location','profession','organization','specialization'].forEach(k => formData.append(k, profileData[k] || ''));
      if (profileData.password) formData.append('password', profileData.password);
      if (profileAvatar) formData.append('avatar', profileAvatar);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || t('profile.profileUpdateFailed'));
      updateUser({ ...user, ...data, token: data.token || user.token });
      setProfileAvatar(null);
      setProfileData(cur => ({ ...cur, password: '' }));
      success(t('profile.profileUpdated'));
    } catch (err) {
      toastError(err.message || t('profile.profileUpdateFailed'));
    } finally {
      setSavingProfile(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || [p.name, p.description, p.location].filter(Boolean).some(f => f.toLowerCase().includes(q));
      const cat = (p.category || '').toLowerCase();
      const matchCat = category === 'all' || cat === category || (category === 'local' && ['grains','cereals','local food'].includes(cat));
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, category]);

  const tabs = [
    { id: 'marketplace', label: t('buyer.marketplace'), icon: 'fa-store' },
    { id: 'messages', label: totalUnread > 0 ? `${t('buyer.messages')} (${totalUnread})` : t('buyer.messages'), icon: 'fa-comments' },
    { id: 'bookmarks', label: `${t('buyer.bookmarks')} (${bookmarks.length})`, icon: 'fa-bookmark' },
    { id: 'profile', label: t('buyer.profile'), icon: 'fa-user' },
    { id: 'about', label: 'About', icon: 'fa-info-circle' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <i className="fas fa-leaf text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">Toumaï</h1>
                <p className="text-xs text-emerald-700/70 dark:text-slate-400">{t('buyer.marketplace')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm font-semibold text-emerald-800 dark:text-emerald-400">{user?.name}</span>
              <LanguageSwitcher />
              <button onClick={() => setShowBugReport(true)} className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-sm font-medium flex items-center gap-1.5">
                <i className="fas fa-bug"></i>
                <span className="hidden sm:inline">Report Issue</span>
              </button>
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition text-sm font-medium">
                {t('common.logout')}
              </button>
            </div>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 font-semibold whitespace-nowrap rounded-xl text-sm transition relative ${
                  activeTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-700 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">

        {/* Marketplace */}
        {activeTab === 'marketplace' && (
          <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-green-700 p-6 md:p-8 shadow-lg">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white">{t('hero.title')}</h2>
                <p className="mt-2 text-emerald-50/90 text-sm">{t('hero.subtitle')}</p>
                <div className="mt-6 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('hero.searchPlaceholder')}
                    className="w-full rounded-2xl border border-white/30 bg-white/15 px-5 py-3 pr-12 text-white placeholder-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                  <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-white/80"></i>
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition border ${
                    category === c.id
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100">
                <i className="fas fa-box-open text-5xl text-slate-300 mb-4"></i>
                <p className="text-xl font-semibold text-slate-700 dark:text-slate-100">{t('common.noResults')}</p>
                <p className="text-slate-500 mt-2">{t('buyer.tryDifferentSearch')}</p>
              </div>
            )}
          </div>
        )}

        {/* Messages — full height split layout */}
        {activeTab === 'messages' && (
          <div className="h-[calc(100vh-8.5rem)] flex overflow-hidden">
            {/* Sidebar */}
            <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-emerald-100 dark:border-slate-700 bg-white dark:bg-slate-900`}>
              <ChatList
                currentUser={user}
                selectedConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onUnreadChange={setTotalUnread}
              />
            </div>
            {/* Chat area */}
            <div className={`${activeConversationId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-50 dark:bg-slate-950`}>
              {activeConversationId ? (
                <ConversationView
                  conversationId={activeConversationId}
                  currentUser={user}
                  onBack={handleBackToList}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-message text-2xl text-emerald-600 dark:text-emerald-400"></i>
                    </div>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{t('chat.selectConversation')}</p>
                    <p className="text-sm mt-1">{t('chat.cleanDashboard')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('buyer.bookmarks')}</h2>
              <p className="text-slate-500 mt-1">{t('buyer.savedProductsDesc')}</p>
            </div>
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {bookmarks.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200">
                <i className="fas fa-bookmark text-5xl text-slate-300 mb-4"></i>
                <p className="text-xl font-semibold text-slate-700 dark:text-slate-100">{t('buyer.noBookmarks')}</p>
                <p className="text-slate-500 mt-2">{t('buyer.bookmarkHint')}</p>
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-emerald-800 dark:text-white mb-6">{t('buyer.profile')}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ProfileAvatarPicker
                  title={t('buyer.profilePicture')}
                  imageUrl={user?.profileImage ? (user.profileImage.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${user.profileImage}` : user.profileImage) : ''}
                  fallbackText={user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  file={profileAvatar}
                  onFileChange={setProfileAvatar}
                  fileLabel={t('buyer.uploadImage')}
                  hint={t('buyer.selectImage')}
                />
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: t('buyer.name') },
                    { key: 'email', label: t('buyer.email') },
                    { key: 'phone', label: t('buyer.phone') },
                    { key: 'location', label: t('buyer.location') },
                    { key: 'profession', label: t('buyer.profession') },
                    { key: 'organization', label: t('buyer.organization') },
                    { key: 'specialization', label: t('buyer.specialization') },
                  ].map(f => (
                    <label key={f.key} className="block">
                      <span className="block text-sm font-semibold text-emerald-800 mb-1">{f.label}</span>
                      <input type="text" name={f.key} value={profileData[f.key] || ''} onChange={handleProfileInput}
                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </label>
                  ))}
                  <label className="block md:col-span-2">
                    <span className="block text-sm font-semibold text-emerald-800 mb-1">{t('buyer.password')}</span>
                    <input type="password" name="password" value={profileData.password} onChange={handleProfileInput}
                      placeholder={t('profile.passwordHint')}
                      className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                  <div className="md:col-span-2">
                    <button onClick={saveProfile} disabled={savingProfile}
                      className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-60">
                      {savingProfile ? t('common.loading') : t('buyer.saveProfile')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* About */}
        {activeTab === 'about' && (
          <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 p-8">
              <h2 className="text-2xl font-bold text-emerald-800 dark:text-white mb-2 flex items-center gap-2">
                <i className="fas fa-leaf text-emerald-600"></i> {t('home.aboutTitle')}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t('home.aboutDesc1')}</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3">{t('home.aboutDesc2')}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 p-8">
              <h2 className="text-2xl font-bold text-emerald-800 dark:text-white mb-6 flex items-center gap-2">
                <i className="fas fa-envelope text-emerald-600"></i> {t('home.contactUs')}
              </h2>
              <div className="space-y-4">
                {[
                  { icon: 'fa-building', label: t('home.contactName'), value: 'Toumaï Marketplace' },
                  { icon: 'fa-envelope', label: 'Email', value: t('home.contactEmail') },
                  { icon: 'fa-phone', label: 'Phone', value: t('home.contactPhone') },
                  { icon: 'fa-map-marker-alt', label: 'Address', value: t('home.contactAddress') },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                      <i className={`fas ${item.icon} text-emerald-600`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">{item.label}</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} />}
    </div>
  );
};

export default BuyerDashboard;
