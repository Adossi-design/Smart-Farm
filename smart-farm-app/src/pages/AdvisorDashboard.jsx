import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const AdvisorDashboard = () => {
  const { user, logout } = useAuth();
  const { advice, addAdvice } = useData();
  const [activeView, setActiveView] = useState('dashboard');

  const [newAdvice, setNewAdvice] = useState({
    title: '',
    category: 'General Farming',
    content: ''
  });
  const [imageFile, setImageFile] = useState(null);
  
  // Profile Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdvice({ ...newAdvice, [name]: value });
  };

  const handleContentChange = (content) => {
    setNewAdvice({ ...newAdvice, content });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', newAdvice.title);
    formData.append('category', newAdvice.category);
    formData.append('content', newAdvice.content);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const success = await addAdvice(formData);
    
    if (success) {
      alert('Advice Published Successfully!');
      setNewAdvice({
        title: '',
        category: 'General Farming',
        content: ''
      });
      setImageFile(null);
    } else {
      alert('Failed to publish advice.');
    }
  };

  const handleEditProfile = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      organization: user?.organization || '',
      specialization: user?.specialization || ''
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

  const myPosts = advice.filter(item => item.author === user?.name || item.authorId === user?.id);

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Post Advice Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-dark-green mb-6">Share Farming Tip / Advice</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={newAdvice.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="e.g. Best practices for irrigation" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Category</label>
                  <select 
                    name="category"
                    value={newAdvice.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green"
                  >
                    <option>General Farming</option>
                    <option>Pest Control</option>
                    <option>Soil Health</option>
                    <option>Livestock Management</option>
                    <option>Weather Alert</option>
                  </select>
                </div>
                
                {/* Rich Text Editor */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Content</label>
                  <div className="bg-white">
                    <ReactQuill 
                      theme="snow" 
                      value={newAdvice.content} 
                      onChange={handleContentChange} 
                      className="h-64 mb-12" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Attach Image (Optional)</label>
                  <input 
                    type="file" 
                    className="w-full" 
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
                <button type="submit" className="bg-primary-green text-white px-6 py-2 rounded font-bold hover:bg-dark-green transition">Publish Advice</button>
              </form>
            </div>

            {/* Recent Posts */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">My Recent Posts</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {myPosts.slice(0, 3).map(item => (
                  <div key={item.id} className="p-4 border-b border-gray-200">
                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                    <small className="text-gray-500 block mt-1">Published: {item.date}</small>
                    <span className="inline-block bg-light-green text-dark-green px-2 py-1 rounded-full text-xs font-bold mt-2">{item.category}</span>
                  </div>
                ))}
                {myPosts.length === 0 && <p className="p-4 text-gray-500 text-center">No posts yet.</p>}
                <div className="p-4 text-center">
                  <button onClick={() => setActiveView('my-posts')} className="text-primary-green font-bold hover:underline">View All</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'my-posts':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-dark-green mb-6">My Advice Posts</h2>
            {myPosts.length > 0 ? (
              <div className="space-y-6">
                {myPosts.map(item => (
                  <div key={item.id} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                      <div className="flex gap-2">
                        <span className="bg-light-green text-dark-green px-3 py-1 rounded-full text-xs font-bold">{item.category}</span>
                        <button className="text-blue-500 hover:text-blue-700 text-sm"><i className="fas fa-edit"></i></button>
                        <button className="text-red-500 hover:text-red-700 text-sm"><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Published: {item.date}</p>
                    <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: item.content }}></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You haven't posted any advice yet.</p>
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
                  <label className="block text-gray-700 font-medium mb-1">Organization</label>
                  <input type="text" name="organization" value={editData.organization} onChange={handleProfileChange} className="w-full px-4 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Specialization</label>
                  <input type="text" name="specialization" value={editData.specialization} onChange={handleProfileChange} className="w-full px-4 py-2 border rounded" />
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
                  <label className="block text-gray-500 text-sm">Organization</label>
                  <p className="font-medium text-gray-800">{user?.organization || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Specialization</label>
                  <p className="font-medium text-gray-800">{user?.specialization || 'Not set'}</p>
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
          <button onClick={() => setActiveView('post-advice')} className={`w-full flex items-center px-6 py-3 ${activeView === 'post-advice' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-pen w-6"></i> Post Advice
          </button>
          <button onClick={() => setActiveView('my-posts')} className={`w-full flex items-center px-6 py-3 ${activeView === 'my-posts' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-history w-6"></i> My Posts
          </button>
          <button onClick={() => setActiveView('profile')} className={`w-full flex items-center px-6 py-3 ${activeView === 'profile' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-user w-6"></i> Profile
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-dark-green">Advisor Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-dark-green font-medium">Welcome, {user?.name}</span>
            <button onClick={logout} className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50 transition">Logout</button>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default AdvisorDashboard;