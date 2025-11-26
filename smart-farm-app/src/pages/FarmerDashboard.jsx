import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const { advice, products, addProduct, updateProduct, deleteProduct } = useData();
  const [activeView, setActiveView] = useState('dashboard');
  
  // Profile Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const [editingProductId, setEditingProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    quantity: '',
    location: '',
    description: '',
    whatsapp: user?.phone || ''
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
    formData.append('quantity', newProduct.quantity);
    formData.append('location', newProduct.location);
    formData.append('description', newProduct.description);
    formData.append('whatsapp', newProduct.whatsapp);
    
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
      alert(editingProductId ? 'Product Updated Successfully!' : 'Product Published Successfully!');
      setNewProduct({
        name: '',
        category: 'Vegetables',
        price: '',
        quantity: '',
        location: '',
        description: '',
        whatsapp: user?.phone || ''
      });
      setImageFile(null);
      setImageUrl('');
      setImageInputMethod('file');
      setEditingProductId(null);
      if (editingProductId) setActiveView('my-products');
    } else {
      alert(result.message || (editingProductId ? 'Failed to update product.' : 'Failed to publish product.'));
    }
  };

  const handleEditClick = (product) => {
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      location: product.location,
      description: product.description,
      whatsapp: product.whatsapp
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(id);
      if (result.success) {
        alert('Product deleted successfully');
      } else {
        alert(result.message || 'Failed to delete product');
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
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(editData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('smartFarmUser', JSON.stringify(updatedUser));
        alert('Profile updated! Please refresh the page to see changes.');
        setIsEditing(false);
        window.location.reload();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const myProducts = products.filter(p => p.sellerId === user?.id);

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Post Product Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-dark-green mb-6">{editingProductId ? 'Edit Product' : 'Post New Product'}</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Product Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="e.g. Organic Potatoes" 
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Category</label>
                    <select 
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green"
                    >
                      <option>Vegetables</option>
                      <option>Fruits</option>
                      <option>Grains</option>
                      <option>Livestock</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Price per Unit</label>
                    <input 
                      type="text" 
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                      placeholder="e.g. 500 RWF" 
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Quantity Available</label>
                    <input 
                      type="text" 
                      name="quantity"
                      value={newProduct.quantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                      placeholder="e.g. 100 kg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Location</label>
                    <input 
                      type="text" 
                      name="location"
                      value={newProduct.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                      placeholder="e.g. Musanze" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Description</label>
                  <textarea 
                    rows="4" 
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="Describe your product..."
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">WhatsApp Number</label>
                  <input 
                    type="text" 
                    name="whatsapp"
                    value={newProduct.whatsapp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="e.g. 250788123456" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Product Image</label>
                  
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="imageMethod" 
                        value="file" 
                        checked={imageInputMethod === 'file'} 
                        onChange={() => setImageInputMethod('file')}
                        className="text-primary-green focus:ring-primary-green"
                      />
                      <span>Upload File</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="imageMethod" 
                        value="url" 
                        checked={imageInputMethod === 'url'} 
                        onChange={() => setImageInputMethod('url')}
                        className="text-primary-green focus:ring-primary-green"
                      />
                      <span>Image URL</span>
                    </label>
                  </div>

                  {imageInputMethod === 'file' ? (
                    <input 
                      type="file" 
                      className="w-full" 
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  ) : (
                    <input 
                      type="url" 
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  )}
                </div>
                <button type="submit" className="w-full bg-primary-green text-white py-2 rounded font-bold hover:bg-dark-green transition">{editingProductId ? 'Update Product' : 'Publish Product'}</button>
                {editingProductId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingProductId(null);
                      setNewProduct({
                        name: '',
                        category: 'Vegetables',
                        price: '',
                        quantity: '',
                        location: '',
                        description: '',
                        whatsapp: user?.phone || ''
                      });
                      setImageFile(null);
                      setImageUrl('');
                      setImageInputMethod('file');
                    }}
                    className="w-full bg-gray-500 text-white py-2 rounded font-bold hover:bg-gray-600 transition mt-2"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>

            {/* Advisory Feed */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Latest Advice</h2>
              <div className="space-y-4">
                {advice.slice(0, 3).map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-primary-green">
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-light-green text-dark-green px-2 py-1 rounded-full text-xs font-bold">{item.category}</span>
                      <small className="text-gray-500">{item.date}</small>
                    </div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <div className="text-sm text-gray-600 mb-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.content }}></div>
                    <button onClick={() => setActiveView('advice')} className="text-primary-green text-sm font-bold hover:underline">Read More</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'my-products':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-dark-green mb-6">My Products</h2>
            {myProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map(product => (
                  <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm">
                    <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image.startsWith('/uploads') ? `http://localhost:5000${product.image}` : product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-box fa-3x text-gray-400"></i>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{product.name}</h3>
                      <p className="text-primary-green font-bold">{product.price}</p>
                      <p className="text-sm text-gray-600 mt-1">Qty: {product.quantity}</p>
                      <div className="mt-3 flex justify-between">
                        <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700"><i className="fas fa-edit"></i> Edit</button>
                        <button onClick={() => handleDeleteClick(product.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i> Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You haven't posted any products yet.</p>
            )}
          </div>
        );
      case 'weather':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-dark-green mb-6">Weather Forecast</h2>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Musanze, Rwanda</h3>
                  <p className="text-gray-600">Monday, 24 November 2025</p>
                </div>
                <div className="text-right">
                  <i className="fas fa-cloud-sun fa-4x text-yellow-500"></i>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-white p-4 rounded shadow-sm">
                  <p className="text-gray-500">Temperature</p>
                  <p className="text-3xl font-bold text-gray-800">24°C</p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <p className="text-gray-500">Humidity</p>
                  <p className="text-3xl font-bold text-gray-800">65%</p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <p className="text-gray-500">Wind Speed</p>
                  <p className="text-3xl font-bold text-gray-800">12 km/h</p>
                </div>
              </div>
              <div className="mt-8">
                <h4 className="font-bold text-gray-800 mb-4">Weekly Forecast</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div key={index} className="bg-white p-3 rounded text-center shadow-sm">
                      <p className="font-bold text-gray-600">{day}</p>
                      <i className={`fas ${index % 2 === 0 ? 'fa-sun text-yellow-500' : 'fa-cloud-rain text-blue-500'} fa-2x my-2`}></i>
                      <p className="font-bold">{22 + index}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'advice':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-dark-green mb-6">Advisory Tips</h2>
            {advice.length > 0 ? (
              <div className="space-y-6">
                {advice.map(item => (
                  <div key={item.id} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                      <span className="bg-light-green text-dark-green px-3 py-1 rounded-full text-xs font-bold">{item.category}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">By {item.author?.name || item.author || 'Advisor'} • {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}</p>
                    {item.image && (
                      <img src={item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image} alt={item.title} className="w-full h-64 object-cover rounded mb-4" />
                    )}
                    <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: item.content }}></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No advisory tips available at the moment.</p>
            )}
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-dark-green mb-6">My Profile</h2>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                <i className="fas fa-user fa-4x"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{user?.name}</h3>
                <p className="text-gray-600">{user?.role}</p>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                  <input type="text" name="name" value={editData.name} onChange={handleProfileChange} className="w-full px-4 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Email</label>
                  <input type="email" name="email" value={editData.email} onChange={handleProfileChange} className="w-full px-4 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Phone</label>
                  <input type="text" name="phone" value={editData.phone} onChange={handleProfileChange} className="w-full px-4 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Location</label>
                  <input type="text" name="location" value={editData.location} onChange={handleProfileChange} className="w-full px-4 py-2 border rounded" />
                </div>
                <div className="flex gap-4 mt-4">
                  <button onClick={saveProfile} className="bg-primary-green text-white px-6 py-2 rounded font-bold hover:bg-dark-green transition">Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600 transition">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-500 text-sm">Email</label>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Phone</label>
                  <p className="font-medium text-gray-800">{user?.phone || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Location</label>
                  <p className="font-medium text-gray-800">{user?.location || 'Not set'}</p>
                </div>
                <button onClick={handleEditProfile} className="bg-primary-green text-white px-6 py-2 rounded font-bold hover:bg-dark-green transition mt-4">Edit Profile</button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-green-50">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-green hidden md:block">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-leaf"></i> Smart Farm
          </Link>
        </div>
        <nav className="mt-6">
          <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center px-6 py-3 ${activeView === 'dashboard' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-home w-6"></i> Dashboard
          </button>
          <button onClick={() => setActiveView('post-product')} className={`w-full flex items-center px-6 py-3 ${activeView === 'post-product' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-plus-circle w-6"></i> Post Product
          </button>
          <button onClick={() => setActiveView('my-products')} className={`w-full flex items-center px-6 py-3 ${activeView === 'my-products' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-list w-6"></i> My Products
          </button>
          <button onClick={() => setActiveView('weather')} className={`w-full flex items-center px-6 py-3 ${activeView === 'weather' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-cloud-sun w-6"></i> Weather
          </button>
          <button onClick={() => setActiveView('advice')} className={`w-full flex items-center px-6 py-3 ${activeView === 'advice' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-book-open w-6"></i> Advisory Tips
          </button>
          <button onClick={() => setActiveView('profile')} className={`w-full flex items-center px-6 py-3 ${activeView === 'profile' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-user w-6"></i> Profile
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-dark-green">Farmer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-dark-green font-medium">Welcome, {user?.name}</span>
            <button onClick={logout} className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50 transition">Logout</button>
          </div>
        </header>

        {/* Weather Widget (Always visible on dashboard view, or maybe just part of dashboard view) */}
        {activeView === 'dashboard' && (
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-md mb-8 flex justify-between items-center cursor-pointer" onClick={() => setActiveView('weather')}>
            <div>
              <h2 className="text-xl font-bold"><i className="fas fa-map-marker-alt mr-2"></i> Northern Province</h2>
              <p>Today, 24 Nov</p>
            </div>
            <div className="text-center">
              <i className="fas fa-sun fa-3x mb-2"></i>
              <h3 className="text-3xl font-bold">28°C</h3>
              <p>Sunny</p>
            </div>
            <div className="text-right">
              <p>Humidity: 45%</p>
              <p>Wind: 12 km/h</p>
              <p>Rain Chance: 10%</p>
            </div>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
};

export default FarmerDashboard;