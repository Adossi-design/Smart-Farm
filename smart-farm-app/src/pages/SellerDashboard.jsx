import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PRODUCT_CATEGORIES, getProductCategories } from '../constants/categories';
import ProfileAvatarPicker from '../components/ProfileAvatarPicker';
import ChatList from '../components/ChatList';
import ConversationView from '../components/ConversationView';
import BugReportModal from '../components/BugReportModal';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SellerDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const [activeView, setActiveView] = useState(searchParams.get('tab') || 'dashboard');
  const [activeConversationId, setActiveConversationId] = useState(searchParams.get('conversationId') || null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [showBugReport, setShowBugReport] = useState(false);
  
  // Profile Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const [editingProductId, setEditingProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: DEFAULT_PRODUCT_CATEGORIES[0],
    price: '',
    quantity: '',
    unit: 'kg',
    quantityAvailable: '',
    location: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageInputMethod, setImageInputMethod] = useState('file'); // 'file' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitFeedback, setSubmitFeedback] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync URL params when navigating from ContactButton
  useEffect(() => {
    const tab = searchParams.get('tab');
    const convId = searchParams.get('conversationId');
    if (tab) setActiveView(tab);
    if (convId) setActiveConversationId(convId);
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (formErrors[name]) {
      setFormErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
    if (submitFeedback) setSubmitFeedback(null);
  };

  const validateProduct = () => {
    const errors = {};

    if (!newProduct.name.trim()) errors.name = t('validation.required');
    if (!newProduct.category.trim()) errors.category = t('validation.required');
    if (!newProduct.price.trim()) errors.price = t('validation.required');
    if (!newProduct.quantityAvailable.toString().trim()) errors.quantityAvailable = t('validation.required');
    if (Number(newProduct.quantityAvailable) <= 0) errors.quantityAvailable = t('validation.valueGreaterThanZero');
    if (!newProduct.unit.trim()) errors.unit = t('validation.required');
    if (!newProduct.location.trim()) errors.location = t('validation.required');
    if (!newProduct.description.trim()) errors.description = t('validation.required');

    if (imageInputMethod === 'url' && imageUrl && !/^https?:\/\//i.test(imageUrl.trim())) {
      errors.imageUrl = t('validation.invalidImageUrl');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitFeedback(null);

    const validationErrors = validateProduct();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitFeedback({
        type: 'error',
        message: t('validation.fillHighlightedFields')
      });
      return;
    }

    setFormErrors({});
    
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('category', newProduct.category);
    formData.append('price', newProduct.price);
    // send structured quantity fields
    formData.append('quantity', newProduct.quantity || `${newProduct.quantityAvailable} ${newProduct.unit}`);
    formData.append('quantityAvailable', newProduct.quantityAvailable);
    formData.append('unit', newProduct.unit);
    formData.append('location', newProduct.location);
    formData.append('description', newProduct.description);
    
    if (imageInputMethod === 'file' && imageFile) {
      formData.append('image', imageFile);
    } else if (imageInputMethod === 'url' && imageUrl) {
      formData.append('imageUrl', imageUrl);
    }

    let result;
    if (editingProductId) {
      result = await updateProduct(editingProductId, formData);
    } else {
      result = await addProduct(formData);
    }
    
    if (result.success) {
      success(editingProductId ? t('seller.productUpdated') : t('seller.productPublished'));
      setNewProduct({
        name: '',
        category: DEFAULT_PRODUCT_CATEGORIES[0],
        price: '',
        quantity: '',
        unit: 'kg',
        quantityAvailable: '',
        location: '',
        description: ''
      });
      setImageFile(null);
      setImageUrl('');
      setImageInputMethod('file');
      setEditingProductId(null);
      if (editingProductId) setActiveView('my-products');
    } else {
      toastError(result.message || (editingProductId ? t('seller.updateFailed') : t('seller.publishFailed')));
    }
  };

  const handleEditClick = (product) => {
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      unit: product.unit || 'kg',
      quantityAvailable: product.quantityAvailable || '',
      location: product.location,
      description: product.description
    });
    
    // Handle image pre-filling logic if needed, or just leave blank to keep existing
    // For now, we reset image inputs as we can't easily pre-fill file inputs
    // But we could set the URL if it's a URL image
    if (product.image && !product.image.startsWith('/uploads')) {
        setImageInputMethod('url');
        setImageUrl(product.image);
    } else {
        setImageInputMethod('file');
        setImageUrl('');
    }
    setImageFile(null);

    setEditingProductId(product.id);
    setActiveView('dashboard'); // Switch to form view
    setSubmitFeedback(null);
    setFormErrors({});
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm(t('seller.deleteConfirm'))) {
      const result = await deleteProduct(id);
      if (result.success) {
        success(t('seller.productDeleted'));
      } else {
        toastError(result.message || t('seller.deleteFailed'));
      }
    }
  };

  const handleEditProfile = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      profession: user?.profession || '',
      organization: user?.organization || '',
      specialization: user?.specialization || '',
      password: ''
    });
    setIsEditing(true);
      setSubmitFeedback(null);
  };

  const handleProfileChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', editData.name || '');
      formData.append('email', editData.email || '');
      formData.append('phone', editData.phone || '');
      formData.append('location', editData.location || '');
      formData.append('profession', editData.profession || '');
      formData.append('organization', editData.organization || '');
      formData.append('specialization', editData.specialization || '');
      if (editData.password) formData.append('password', editData.password);
      if (profileAvatar) formData.append('avatar', profileAvatar);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        updateUser({ ...user, ...updatedUser, token: updatedUser.token || user.token });
        setProfileAvatar(null);
        success(t('seller.profileUpdated'));
        setIsEditing(false);
      } else {
        toastError(t('seller.profileUpdateFailed'));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSavingProfile(false);
    }
  };

  const myProducts = products.filter(p => p.sellerId === user?.id);
  const categoryOptions = getProductCategories(products);
  const filteredMyProducts = myProducts.filter((product) => {
    const search = productSearch.trim().toLowerCase();
    const matchesSearch = !search || [product.name, product.category, product.location, product.description]
      .filter(Boolean)
      .some(field => String(field).toLowerCase().includes(search));
    const matchesCategory = categoryFilter === 'all' || (product.category || '').toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });
  const sidebarItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: 'home' },
    { id: 'post-product', label: t('seller.addProduct'), icon: 'plus-circle' },
    { id: 'my-products', label: t('seller.myProducts'), icon: 'boxes' },
    { id: 'messages', label: totalUnread > 0 ? `${t('common.messages')} (${totalUnread})` : t('common.messages'), icon: 'comments' },
    { id: 'profile', label: t('common.profile'), icon: 'user-circle' },
    { id: 'about', label: 'About', icon: 'info-circle' },
  ];

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Analytics Header */}
            <h2 className="text-3xl font-bold text-emerald-800 flex items-center gap-3">
              <i className="fas fa-chart-line text-emerald-700"></i> {t('seller.dashboard')}
            </h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-emerald-800 text-sm font-medium">{t('seller.myProducts')}</span>
                  <i className="fas fa-boxes text-emerald-700 text-xl"></i>
                </div>
                <p className="text-3xl font-bold text-slate-900">{myProducts.length}</p>
                <p className="text-xs text-slate-500 mt-2">{t('seller.activeListings')}</p>
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-emerald-800 text-sm font-medium">{t('seller.activeConversations')}</span>
                  <i className="fas fa-comments text-emerald-700 text-xl"></i>
                </div>
                <p className="text-3xl font-bold text-slate-900">{totalUnread > 0 ? <span className="text-emerald-600">{totalUnread}</span> : '0'}</p>
                <p className="text-xs text-slate-500 mt-2">{t('seller.ongoingChats')}</p>
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-emerald-800 text-sm font-medium">{t('seller.responseRate')}</span>
                  <i className="fas fa-percent text-emerald-700 text-xl"></i>
                </div>
                <p className="text-3xl font-bold text-slate-900">100%</p>
                <p className="text-xs text-slate-500 mt-2">{t('seller.buyerSatisfaction')}</p>
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-emerald-800 text-sm font-medium">{t('common.profile')}</span>
                  <i className="fas fa-star text-emerald-700 text-xl"></i>
                </div>
                <p className="text-3xl font-bold text-slate-900">{user?.averageRating?.toFixed(1) || '5.0'}</p>
                <p className="text-xs text-slate-500 mt-2">{t('seller.basedOnReviews', { count: user?.totalReviews || 0 })}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <i className="fas fa-lightning-bolt text-emerald-700"></i> {t('seller.quickActions')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveView('post-product')}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <i className="fas fa-plus"></i> {t('seller.addProduct')}
                </button>
                <button 
                  onClick={() => setActiveView('my-products')}
                  className="px-6 py-3 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <i className="fas fa-eye"></i> {t('seller.myProducts')}
                </button>
                <button 
                  onClick={() => setActiveView('messages')}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <i className="fas fa-envelope"></i> {t('common.messages')}{totalUnread > 0 ? ` (${totalUnread})` : ''}
                </button>
              </div>
            </div>

            {/* Recent Products Preview */}
            {myProducts.length > 0 && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-recently-watched text-emerald-700"></i> {t('seller.myProducts')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {myProducts.slice(0, 5).map(product => (
                    <div key={product.id} className="rounded-lg border border-emerald-200 overflow-hidden hover:shadow-lg transition bg-white">
                      <div className="h-32 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${product.image}` : product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <i className="fas fa-box text-emerald-500 text-2xl"></i>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-900 truncate">{product.name}</h4>
                        <p className="text-emerald-700 font-bold mt-1">{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'post-product':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <i className="fas fa-plus-circle text-emerald-700"></i> {editingProductId ? t('seller.editProduct') : t('seller.addProduct')}
              </h2>
              <p className="text-emerald-900/70 mb-8">{t('seller.shareProductsDesc')}</p>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-emerald-900 font-medium mb-2">{t('seller.productName')} *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                        aria-invalid={Boolean(formErrors.name)}
                        className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-400 ring-red-400' : 'border-emerald-200 focus:ring-emerald-500'}`}
                    placeholder={t('farmer.productNamePlaceholder')} 
                    required
                  />
                      {formErrors.name && <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-emerald-900 font-medium mb-2">{t('seller.category')} *</label>
                    <select 
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(formErrors.category)}
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${formErrors.category ? 'border-red-400 ring-red-400' : 'border-emerald-200 focus:ring-emerald-500'}`}
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {formErrors.category && <p className="mt-2 text-sm text-red-600">{formErrors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-emerald-900 font-medium mb-2">{t('seller.price')} *</label>
                    <input 
                      type="text" 
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(formErrors.price)}
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 ${formErrors.price ? 'border-red-400 ring-red-400' : 'border-emerald-200 focus:ring-emerald-500'}`}
                      placeholder={t('farmer.pricePlaceholder')} 
                      required
                    />
                    {formErrors.price && <p className="mt-2 text-sm text-red-600">{formErrors.price}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-emerald-900 font-medium mb-2">{t('seller.quantity')} *</label>
                    <input 
                      type="number" 
                      name="quantityAvailable"
                      value={newProduct.quantityAvailable}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(formErrors.quantityAvailable)}
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 ${formErrors.quantityAvailable ? 'border-red-400 ring-red-400' : 'border-emerald-200 focus:ring-emerald-500'}`}
                      placeholder={t('farmer.quantityPlaceholder')} 
                      required
                    />
                    {formErrors.quantityAvailable && <p className="mt-2 text-sm text-red-600">{formErrors.quantityAvailable}</p>}
                  </div>
                  <div>
                    <label className="block text-emerald-900 font-medium mb-2">{t('seller.unit')} *</label>
                    <select name="unit" value={newProduct.unit} onChange={handleInputChange} aria-invalid={Boolean(formErrors.unit)} className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${formErrors.unit ? 'border-red-400 ring-red-400' : 'border-emerald-200 focus:ring-emerald-500'}`}>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="ton">ton</option>
                      <option value="piece">piece</option>
                    </select>
                    {formErrors.unit && <p className="mt-2 text-sm text-red-600">{formErrors.unit}</p>}
                  </div>
                  <div>
                    <label className="block text-emerald-900 font-medium mb-2">{t('seller.location')} *</label>
                    <input 
                      type="text" 
                      name="location"
                      value={newProduct.location}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(formErrors.location)}
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 ${formErrors.location ? 'border-red-400 ring-red-400' : 'border-emerald-200 focus:ring-emerald-500'}`}
                      placeholder={t('farmer.locationPlaceholder')} 
                      required
                    />
                    {formErrors.location && <p className="mt-2 text-sm text-red-600">{formErrors.location}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-emerald-900 font-medium mb-2">{t('seller.description')} *</label>
                  <textarea 
                    rows="4" 
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(formErrors.description)}
                    className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 resize-none ${formErrors.description ? 'border-red-400 ring-red-400' : 'border-emerald-200 focus:ring-emerald-500'}`}
                    placeholder={t('farmer.descriptionPlaceholder')}
                    required
                  ></textarea>
                  {formErrors.description && <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>}
                </div>
                <div>
                  <label className="block text-emerald-900 font-medium mb-3">{t('seller.image')}</label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer text-emerald-700">
                      <input 
                        type="radio" 
                        name="imageMethod" 
                        value="file" 
                        checked={imageInputMethod === 'file'} 
                        onChange={() => setImageInputMethod('file')}
                      />
                      <i className="fas fa-upload"></i>
                      <span>{t('farmer.uploadFile')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-emerald-700">
                      <input 
                        type="radio" 
                        name="imageMethod" 
                        value="url" 
                        checked={imageInputMethod === 'url'} 
                        onChange={() => setImageInputMethod('url')}
                      />
                      <i className="fas fa-link"></i>
                      <span>{t('farmer.imageUrl')}</span>
                    </label>
                  </div>
                  {imageInputMethod === 'file' ? (
                    <input 
                      type="file" 
                      className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  ) : (
                    <>
                      <input 
                        type="url" 
                        aria-invalid={Boolean(formErrors.imageUrl)}
                        className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 ${formErrors.imageUrl ? 'border-red-400 ring-red-400' : 'border-emerald-200 focus:ring-emerald-500'}`}
                        placeholder={t('farmer.imageUrlPlaceholder')}
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          if (formErrors.imageUrl) {
                            setFormErrors((current) => {
                              const next = { ...current };
                              delete next.imageUrl;
                              return next;
                            });
                          }
                        }}
                      />
                      {formErrors.imageUrl && <p className="mt-2 text-sm text-red-600">{formErrors.imageUrl}</p>}
                    </>
                  )}
                </div>
                <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-sm">
                  <i className={`fas ${editingProductId ? 'fa-sync' : 'fa-paper-plane'}`}></i>
                  {editingProductId ? t('seller.editProduct') : t('seller.addProduct')}
                </button>
                {editingProductId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingProductId(null);
                      setNewProduct({
                        name: '',
                        category: DEFAULT_PRODUCT_CATEGORIES[0],
                        price: '',
                        quantity: '',
                        unit: 'kg',
                        quantityAvailable: '',
                        location: '',
                        description: ''
                      });
                      setImageFile(null);
                      setImageUrl('');
                      setImageInputMethod('file');
                    }}
                    className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-3 rounded-lg font-bold transition"
                  >
                    {t('common.cancel')}
                  </button>
                )}
              </form>
            </div>
          </div>
        );
      case 'my-products':
        return (
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
              <i className="fas fa-boxes text-emerald-700"></i> {t('seller.myProducts')}
            </h2>
            {filteredMyProducts.length > 0 ? (
              <>
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={t('farmer.searchProductsPlaceholder')}
                      className="w-full sm:w-72 px-4 py-2 bg-white border border-emerald-200 rounded-lg text-slate-900 placeholder-slate-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 bg-white border border-emerald-200 rounded-lg text-slate-900">
                      <option value="all">{t('buyer.allCategories')}</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMyProducts.map(product => (
                  <div key={product.id} className="group rounded-2xl bg-emerald-50 border border-emerald-200 overflow-hidden hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 transform hover:scale-105">
                    <div className="h-48 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center overflow-hidden relative">
                      {product.image ? (
                        <img 
                          src={product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${product.image}` : product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-box fa-4x text-emerald-500"></i>
                      )}
                      <div className="absolute inset-0 bg-emerald-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-emerald-900 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-emerald-700 font-bold text-lg mb-3">{product.price}</p>
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <span className="text-emerald-700">
                          <i className="fas fa-cube mr-1"></i>
                          {product.quantity}
                        </span>
                        <span className="text-emerald-700">
                          <i className="fas fa-tag mr-1 text-emerald-600"></i>
                          {product.category}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleEditClick(product)} 
                          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-edit"></i> {t('common.edit')}
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product.id)} 
                          className="flex-1 border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-trash"></i> {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            ) : (
              <div className="text-center py-16 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
                <i className="fas fa-inbox text-5xl text-emerald-500 mb-4"></i>
                <p className="text-emerald-900 text-lg">{t('seller.noProducts')}</p>
                <p className="text-emerald-700 text-sm mt-2">{t('farmer.useDashboardToPost')}</p>
              </div>
            )}
          </div>
        );
      case 'messages':
        return (
          <div className="h-[calc(100vh-10rem)] flex overflow-hidden rounded-2xl border border-emerald-200 shadow-sm">
            <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-emerald-100 dark:border-slate-700 bg-white dark:bg-slate-900`}>
              <ChatList
                currentUser={user}
                selectedConversationId={activeConversationId}
                onSelectConversation={(id) => setActiveConversationId(String(id))}
                onUnreadChange={setTotalUnread}
              />
            </div>
            <div className={`${activeConversationId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-50 dark:bg-slate-950`}>
              {activeConversationId ? (
                <ConversationView
                  conversationId={activeConversationId}
                  currentUser={user}
                  onBack={() => setActiveConversationId(null)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-message text-2xl text-emerald-600"></i>
                    </div>
                    <p className="font-semibold text-slate-600">{t('chat.selectConversation')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
              <i className="fas fa-user-circle text-emerald-700"></i> My Profile
            </h2>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 shadow-sm">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-white p-4">
                    {user?.profileImage ? (
                      <img src={user.profileImage.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${user.profileImage}` : user.profileImage} alt={user?.name || 'Profile'} className="h-16 w-16 rounded-full object-cover border border-emerald-200" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{user?.name || '-'}</p>
                      <p className="text-sm text-slate-600">{user?.email || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-emerald-200 bg-white p-4"><p className="text-xs uppercase tracking-wide text-emerald-700">{t('buyer.phone')}</p><p className="font-semibold text-slate-900">{user?.phone || '-'}</p></div>
                    <div className="rounded-lg border border-emerald-200 bg-white p-4"><p className="text-xs uppercase tracking-wide text-emerald-700">{t('buyer.location')}</p><p className="font-semibold text-slate-900">{user?.location || '-'}</p></div>
                    <div className="rounded-lg border border-emerald-200 bg-white p-4"><p className="text-xs uppercase tracking-wide text-emerald-700">{t('buyer.profession')}</p><p className="font-semibold text-slate-900">{user?.profession || '-'}</p></div>
                    <div className="rounded-lg border border-emerald-200 bg-white p-4"><p className="text-xs uppercase tracking-wide text-emerald-700">{t('profile.organization')}</p><p className="font-semibold text-slate-900">{user?.organization || '-'}</p></div>
                  </div>
                  <button onClick={handleEditProfile} className="w-full rounded-lg bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 transition">
                    {t('profile.editProfile')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ProfileAvatarPicker
                    title={t('profile.profilePicture')}
                    imageUrl={user?.profileImage ? (user.profileImage.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${user.profileImage}` : user.profileImage) : ''}
                    fallbackText={user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    file={profileAvatar}
                    onFileChange={setProfileAvatar}
                    fileLabel={t('profile.uploadImage') || t('buyer.uploadImage')}
                    hint={t('buyer.selectImage')}
                    compact
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['name','email','phone','location','profession','organization','specialization'].map((field) => (
                      <label key={field} className="block text-sm font-semibold text-emerald-800 capitalize">{field}
                        <input type="text" name={field} value={editData[field] || ''} onChange={handleProfileChange} className="mt-2 w-full rounded-lg border border-emerald-200 bg-white p-3 text-slate-900" />
                      </label>
                    ))}
                  </div>
                  <label className="block text-sm font-semibold text-emerald-800">{t('profile.newPassword')}
                    <input type="password" name="password" value={editData.password || ''} onChange={handleProfileChange} className="mt-2 w-full rounded-lg border border-emerald-200 bg-white p-3 text-slate-900" />
                  </label>
                  <div className="flex gap-3">
                    <button onClick={saveProfile} disabled={savingProfile} className="flex-1 rounded-lg bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-60">
                      {savingProfile ? t('profile.saving') : t('profile.saveChanges')}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 rounded-lg border border-emerald-300 bg-white py-3 font-semibold text-emerald-800 hover:bg-emerald-100 transition">
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6 max-w-2xl">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <i className="fas fa-leaf text-emerald-600"></i> {t('home.aboutTitle')}
              </h2>
              <p className="text-slate-600 leading-relaxed">{t('home.aboutDesc1')}</p>
              <p className="text-slate-600 leading-relaxed mt-3">{t('home.aboutDesc2')}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <i className="fas fa-envelope text-emerald-600"></i> {t('home.contactUs')}
              </h2>
              <div className="space-y-4">
                {[
                  { icon: 'fa-building', label: 'Platform', value: 'Toumaï Marketplace' },
                  { icon: 'fa-envelope', label: 'Email', value: t('home.contactEmail') },
                  { icon: 'fa-phone', label: 'Phone', value: t('home.contactPhone') },
                  { icon: 'fa-map-marker-alt', label: 'Address', value: t('home.contactAddress') },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-emerald-100">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <i className={`fas ${item.icon} text-emerald-600`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{item.label}</p>
                      <p className="text-slate-800 font-medium mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-green-50 text-slate-900 overflow-hidden">
      {/* Mobile top nav */}
      <div className="lg:hidden shrink-0 border-b border-emerald-300 bg-gradient-to-r from-emerald-600 to-green-600 p-3 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-white font-bold text-sm">Toumaï</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={() => setShowBugReport(true)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-red-300/50 bg-white/10 text-red-200 text-xs font-medium">
              <i className="fas fa-bug"></i>
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                activeView === item.id ? 'bg-white text-emerald-800 shadow-sm' : 'border border-white/30 bg-emerald-500/25 text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — fixed, never scrolls */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-emerald-300 bg-gradient-to-b from-emerald-700 to-green-700 shadow-lg">
          <div className="shrink-0 border-b border-white/15 p-6">
            <h1 className="text-xl font-bold text-white">Toumaï {t('seller.dashboard')}</h1>
            <p className="mt-1 text-sm text-emerald-100">{t('seller.shareProductsDesc')}</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                  activeView === item.id
                    ? 'bg-white text-emerald-800 shadow-md shadow-black/10'
                    : 'text-emerald-50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className={`fas fa-${item.icon}`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="shrink-0 border-t border-white/15 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => setShowBugReport(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300/50 bg-white/10 text-red-200 hover:bg-white/20 text-xs font-medium transition"
              >
                <i className="fas fa-bug"></i> Report
              </button>
            </div>
            <button onClick={() => { logout(); success(t('common.loggedOut') || 'Logged out successfully'); }} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20">
              {t('common.logout')}
            </button>
          </div>
        </aside>

        {/* Main content — only this scrolls */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{renderContent()}</main>
      </div>

      {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} />}
    </div>
  );
};

export default SellerDashboard;
