import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PRODUCT_CATEGORIES, getProductCategories } from '../constants/categories';
import ProfileAvatarPicker from '../components/ProfileAvatarPicker';

const FarmerDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('dashboard');
  
  // Profile Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      alert(editingProductId ? t('seller.productUpdated') : t('seller.productPublished'));
      setNewProduct({
        name: '',
        category: DEFAULT_PRODUCT_CATEGORIES[0],
        price: '',
        quantity: '',
        location: '',
        description: ''
      });
      setImageFile(null);
      setImageUrl('');
      setImageInputMethod('file');
      setEditingProductId(null);
      if (editingProductId) setActiveView('my-products');
    } else {
      alert(result.message || (editingProductId ? t('seller.updateFailed') : t('seller.publishFailed')));
    }
  };

  const handleEditClick = (product) => {
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
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
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm(t('seller.deleteConfirm'))) {
      const result = await deleteProduct(id);
      if (result.success) {
        alert(t('seller.productDeleted'));
      } else {
        alert(result.message || t('seller.deleteFailed'));
      }
    }
  };

  const handleEditProfile = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || ''
    });
    setIsEditing(true);
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
        alert(t('profile.profileUpdated'));
        setIsEditing(false);
      } else {
        alert(t('profile.profileUpdateFailed'));
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
    { id: 'weather', label: t('farmer.weather'), icon: 'cloud-sun' },
    { id: 'profile', label: t('common.profile'), icon: 'user-circle' },
  ];

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Post Product Form */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-800/50 border border-slate-700 p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <i className="fas fa-plus-circle text-emerald-400"></i> {editingProductId ? t('seller.editProduct') : t('seller.addProduct')}
              </h2>
              <p className="text-slate-400 mb-6">{t('farmer.shareHarvest')}</p>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">{t('seller.productName')}</label>
                  <input 
                    type="text" 
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                    placeholder={t('farmer.productNamePlaceholder')} 
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">{t('seller.category')}</label>
                    <select 
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">{t('seller.price')}</label>
                    <input 
                      type="text" 
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                      placeholder={t('farmer.pricePlaceholder')} 
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">{t('seller.quantity')}</label>
                    <input 
                      type="number" 
                      name="quantityAvailable"
                      value={newProduct.quantityAvailable}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                      placeholder={t('farmer.quantityPlaceholder')} 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">{t('seller.unit')}</label>
                    <select name="unit" value={newProduct.unit} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500">
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="ton">ton</option>
                      <option value="piece">piece</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">{t('seller.location')}</label>
                    <input 
                      type="text" 
                      name="location"
                      value={newProduct.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                      placeholder={t('farmer.locationPlaceholder')} 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">{t('seller.description')}</label>
                  <textarea 
                    rows="4" 
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 resize-none"
                    placeholder={t('farmer.descriptionPlaceholder')}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-3">{t('seller.image')}</label>
                  <div className="flex gap-4 mb-4 bg-slate-700/50 p-3 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-emerald-400 transition-colors">
                      <input 
                        type="radio" 
                        name="imageMethod" 
                        value="file" 
                        checked={imageInputMethod === 'file'} 
                        onChange={() => setImageInputMethod('file')}
                        className="text-emerald-500"
                      />
                      <i className="fas fa-upload"></i>
                      <span>{t('farmer.uploadFile')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-emerald-400 transition-colors">
                      <input 
                        type="radio" 
                        name="imageMethod" 
                        value="url" 
                        checked={imageInputMethod === 'url'} 
                        onChange={() => setImageInputMethod('url')}
                        className="text-emerald-500"
                      />
                      <i className="fas fa-link"></i>
                      <span>{t('farmer.imageUrl')}</span>
                    </label>
                  </div>

                  {imageInputMethod === 'file' ? (
                    <input 
                      type="file" 
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 file:text-emerald-400 file:bg-slate-800 file:border-0 file:px-3 file:py-2 file:rounded file:mr-3 focus:outline-none focus:border-emerald-500" 
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  ) : (
                    <input 
                      type="url" 
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                      placeholder={t('farmer.imageUrlPlaceholder')}
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  )}
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2">
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
                        location: '',
                        description: ''
                      });
                      setImageFile(null);
                      setImageUrl('');
                      setImageInputMethod('file');
                    }}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition-all duration-200"
                  >
                    {t('common.cancel')}
                  </button>
                )}
              </form>
            </div>


          </div>
        );
      case 'post-product':
        return (
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-8 backdrop-blur-sm max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6">{t('farmer.postProductTitle')}</h2>
            <p className="text-slate-300 mb-8">{t('farmer.postProductDesc')}</p>
            {/* Reuse the form from dashboard - you can extract it into a separate component if needed */}
            <p className="text-slate-400">{t('farmer.useDashboardToPost')}</p>
          </div>
        );
      case 'my-products':
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="fas fa-boxes text-emerald-400"></i> {t('seller.myProducts')}
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
                      className="w-full sm:w-72 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                      <option value="all">{t('buyer.allCategories')}</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 [&>*]:h-full">
                {filteredMyProducts.map(product => (
                  <div key={product.id} className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 transform hover:scale-105">
                    <div className="h-48 bg-slate-700 flex items-center justify-center overflow-hidden relative">
                      {product.image ? (
                        <img 
                          src={product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${product.image}` : product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-box fa-4x text-slate-600"></i>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-emerald-400 font-bold text-lg mb-3">{product.price}</p>
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <span className="text-slate-400">
                          <i className="fas fa-cube mr-1"></i>
                          {product.quantity}
                        </span>
                        <span className="text-slate-400">
                          <i className="fas fa-map-marker-alt mr-1 text-amber-400"></i>
                          {product.category}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleEditClick(product)} 
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-edit"></i> {t('common.edit')}
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product.id)} 
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
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
              <div className="text-center py-16 rounded-2xl bg-slate-800/50 border border-slate-700">
                <i className="fas fa-inbox text-5xl text-slate-600 mb-4"></i>
                <p className="text-slate-300 text-lg">{t('seller.noProducts')}</p>
                <p className="text-slate-500 text-sm mt-2">{t('farmer.useDashboardToPost')}</p>
              </div>
            )}
          </div>
        );
      case 'weather':
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="fas fa-cloud-sun text-yellow-400"></i> {t('advisor.weatherForecast')}
            </h2>
            <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-white">{t('farmer.defaultCity')}</h3>
                  <p className="text-slate-400 text-lg">{t('farmer.defaultDate')}</p>
                </div>
                <i className="fas fa-cloud-sun fa-5x text-yellow-400 opacity-80"></i>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <p className="text-slate-400 text-sm mb-2">{t('farmer.temperature')}</p>
                  <p className="text-3xl font-bold text-emerald-400">24°C</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <p className="text-slate-400 text-sm mb-2">{t('farmer.humidity')}</p>
                  <p className="text-3xl font-bold text-cyan-400">65%</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <p className="text-slate-400 text-sm mb-2">{t('farmer.windSpeed')}</p>
                  <p className="text-3xl font-bold text-blue-400">12 km/h</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <p className="text-slate-400 text-sm mb-2">{t('farmer.rainChance')}</p>
                  <p className="text-3xl font-bold text-purple-400">15%</p>
                </div>
              </div>
              <div className="mt-8">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-calendar-days"></i> {t('farmer.weeklyForecast')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div key={index} className="bg-slate-700/50 p-4 rounded-lg text-center border border-slate-600 hover:border-slate-500 transition-colors">
                      <p className="font-bold text-slate-300 mb-2">{day}</p>
                      <i className={`fas ${index % 2 === 0 ? 'fa-sun text-yellow-400' : 'fa-cloud-rain text-cyan-400'} fa-2x mb-2`}></i>
                      <p className="font-bold text-white">{22 + index}°C</p>
                      <p className="text-slate-500 text-xs mt-1">{Math.floor(Math.random() * 30)}% rain</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="fas fa-user-circle text-emerald-400"></i> {t('seller.myProfile')}
            </h2>
            <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-6 mb-8">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${user.profileImage}` : user.profileImage}
                    alt={user?.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-emerald-400 flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-3xl font-bold text-white">{user?.name}</h3>
                  <p className="text-emerald-400 text-lg font-medium capitalize">{t('farmer.accountLabel', { role: user?.role })}</p>
                  <p className="text-slate-400 mt-2"><i className="fas fa-envelope mr-2"></i>{user?.email}</p>
                </div>
              </div>
              
              {isEditing ? (
                <div className="space-y-5">
                  <ProfileAvatarPicker
                    title={t('profile.profilePicture')}
                    imageUrl={user?.profileImage ? (user.profileImage.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${user.profileImage}` : user.profileImage) : ''}
                    fallbackText={user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    file={profileAvatar}
                    onFileChange={setProfileAvatar}
                    fileLabel={t('buyer.uploadImage')}
                    hint={t('buyer.selectImage')}
                    compact
                  />
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">{t('register.fullName')}</label>
                    <input type="text" name="name" value={editData.name} onChange={handleProfileChange} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">{t('buyer.email')}</label>
                    <input type="email" name="email" value={editData.email} onChange={handleProfileChange} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">{t('buyer.phone')}</label>
                    <input type="text" name="phone" value={editData.phone} onChange={handleProfileChange} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">{t('buyer.location')}</label>
                    <input type="text" name="location" value={editData.location} onChange={handleProfileChange} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200" />
                  </div>
                  <div className="flex gap-4 mt-6 pt-6 border-t border-slate-700">
                    <button onClick={saveProfile} disabled={savingProfile} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
                      <i className="fas fa-check"></i> {savingProfile ? t('profile.saving') : t('profile.saveChanges')}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200">
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <label className="block text-slate-400 text-sm mb-1">{t('buyer.email')}</label>
                    <p className="font-medium text-white">{user?.email}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <label className="block text-slate-400 text-sm mb-1">{t('buyer.phone')}</label>
                    <p className="font-medium text-white">{user?.phone || <span className="text-slate-500">{t('profile.notSet')}</span>}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <label className="block text-slate-400 text-sm mb-1">{t('buyer.location')}</label>
                    <p className="font-medium text-white">{user?.location || <span className="text-slate-500">{t('profile.notSet')}</span>}</p>
                  </div>
                  <button onClick={handleEditProfile} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 mt-6 flex items-center justify-center gap-2">
                    <i className="fas fa-edit"></i> {t('profile.editProfile')}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-leaf text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              Smart Farm
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-emerald-400 font-semibold">{user?.name}</p>
              <p className="text-slate-400 text-sm">{t('farmer.farmerAccount')}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 font-medium"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>{t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-slate-700 bg-slate-900/50">
          <nav className="p-6 space-y-3">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <i className={`fas fa-${item.icon}`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="lg:hidden border-b border-slate-700 bg-slate-900/70 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <i className={`fas fa-${item.icon} mr-2`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {/* Welcome Banner */}
          {activeView === 'dashboard' && (
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 p-8">
              <h2 className="text-3xl font-bold text-white mb-2">{t('farmer.welcomeBack', { name: user?.name })}</h2>
              <p className="text-slate-300">{t('farmer.dashboardIntro')}</p>
            </div>
          )}

          {/* Weather Widget (Dashboard Only) */}
          {activeView === 'dashboard' && (
            <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
                onClick={() => setActiveView('my-products')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 font-medium">{t('farmer.activeProducts')}</p>
                    <p className="text-4xl font-bold mt-2">{products?.length || 0}</p>
                  </div>
                  <i className="fas fa-boxes text-5xl opacity-20"></i>
                </div>
              </div>

              {/* Weather Card */}
              <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-cloud-sun text-yellow-400"></i> {t('farmer.currentWeather')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">{t('farmer.temperature')}</p>
                    <p className="text-2xl font-bold text-emerald-400">28°C</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">{t('farmer.humidity')}</p>
                    <p className="text-2xl font-bold text-cyan-400">45%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">{t('farmer.windSpeed')}</p>
                    <p className="text-2xl font-bold text-amber-400">12 km/h</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">{t('farmer.rainChance')}</p>
                    <p className="text-2xl font-bold text-blue-400">10%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default FarmerDashboard;