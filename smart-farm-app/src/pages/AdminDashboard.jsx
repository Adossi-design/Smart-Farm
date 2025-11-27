import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { products, advice } = useData();
  const [activeView, setActiveView] = useState('dashboard');

  const [stats, setStats] = useState({ farmers: 0, advisors: 0, products: 0, advice: 0 });
  const [advisors, setAdvisors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [farmers, setFarmers] = useState([]);
  
  const [newAdvisor, setNewAdvisor] = useState({
    name: '',
    email: '',
    organization: '',
    specialization: '',
    password: ''
  });

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      if (user?.token) {
        try {
          const statsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }

          const advisorsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/advisors`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (advisorsRes.ok) {
            const advisorsData = await advisorsRes.json();
            setAdvisors(advisorsData);
          }

          const adminsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/admins`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (adminsRes.ok) {
            const adminsData = await adminsRes.json();
            setAdmins(adminsData);
          }

          const farmersRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/farmers`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (farmersRes.ok) {
            const farmersData = await farmersRes.json();
            setFarmers(farmersData);
          }

        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      }
    };
    fetchAdminData();
  }, [user]);

  const handleAdvisorInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdvisor({ ...newAdvisor, [name]: value });
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({ ...newAdmin, [name]: value });
  };

  const handleRegisterAdvisor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/advisors`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newAdvisor),
      });
      
      if (response.ok) {
        alert(`Advisor ${newAdvisor.name} registered successfully!`);
        setNewAdvisor({
          name: '',
          email: '',
          organization: '',
          specialization: '',
          password: ''
        });
        // Refresh advisors list
        const advisorsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/advisors`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const advisorsData = await advisorsRes.json();
        setAdvisors(advisorsData);
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error("Error registering advisor:", error);
    }
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/admins`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newAdmin),
      });
      
      if (response.ok) {
        alert(`Admin ${newAdmin.name} registered successfully!`);
        setNewAdmin({
          name: '',
          email: '',
          password: ''
        });
        // Refresh admins list
        const adminsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/admins`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const adminsData = await adminsRes.json();
        setAdmins(adminsData);
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error("Error registering admin:", error);
    }
  };

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        const userStatsData = [
          { name: 'Farmers', count: stats.farmers },
          { name: 'Advisors', count: stats.advisors },
          { name: 'Admins', count: admins.length || 1 } 
        ];

        const contentStatsData = [
          { name: 'Products', value: stats.products },
          { name: 'Advice', value: stats.advice }
        ];
        
        const COLORS = ['#2F855A', '#48BB78', '#F6E05E', '#F6AD55'];

        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center cursor-pointer hover:shadow-lg transition" onClick={() => setActiveView('view-farmers')}>
                <h3 className="text-gray-500 font-medium">Total Farmers</h3>
                <p className="text-3xl font-bold text-dark-green mt-2">{stats.farmers}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center cursor-pointer hover:shadow-lg transition" onClick={() => setActiveView('manage-advisors')}>
                <h3 className="text-gray-500 font-medium">Total Advisors</h3>
                <p className="text-3xl font-bold text-dark-green mt-2">{stats.advisors}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-gray-500 font-medium">Products Listed</h3>
                <p className="text-3xl font-bold text-dark-green mt-2">{stats.products}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-gray-500 font-medium">Advice Posts</h3>
                <p className="text-3xl font-bold text-dark-green mt-2">{stats.advice}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">User Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userStatsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#2F855A" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Content Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentStatsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contentStatsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case 'manage-advisors':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Advisors List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Registered Advisors</h2>
                <button className="bg-primary-green text-white px-4 py-2 rounded hover:bg-dark-green transition text-sm">
                  <i className="fas fa-download mr-2"></i> Export List
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-light-green text-dark-green">
                      <th className="p-3 border-b">Name</th>
                      <th className="p-3 border-b">Organization</th>
                      <th className="p-3 border-b">Specialization</th>
                      <th className="p-3 border-b">Status</th>
                      <th className="p-3 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advisors.length > 0 ? (
                      advisors.map(advisor => (
                        <tr key={advisor.id}>
                          <td className="p-3 border-b">{advisor.name}</td>
                          <td className="p-3 border-b">{advisor.organization || '-'}</td>
                          <td className="p-3 border-b">{advisor.specialization || '-'}</td>
                          <td className="p-3 border-b"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span></td>
                          <td className="p-3 border-b"><button className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-3 text-center text-gray-500">No advisors found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Register Advisor Form */}
            <div className="bg-white p-6 rounded-lg shadow-md h-fit">
              <h2 className="text-xl font-bold text-dark-green mb-6">Register New Advisor</h2>
              <form className="space-y-4" onSubmit={handleRegisterAdvisor}>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={newAdvisor.name}
                    onChange={handleAdvisorInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="Advisor Name" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={newAdvisor.email}
                    onChange={handleAdvisorInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="advisor@example.com" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Organization</label>
                  <input 
                    type="text" 
                    name="organization"
                    value={newAdvisor.organization}
                    onChange={handleAdvisorInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="Organization Name" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Specialization</label>
                  <input 
                    type="text" 
                    name="specialization"
                    value={newAdvisor.specialization}
                    onChange={handleAdvisorInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="e.g. Agronomy" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={newAdvisor.password}
                    onChange={handleAdvisorInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="Create Password" 
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-primary-green text-white py-2 rounded font-bold hover:bg-dark-green transition">Create Account</button>
              </form>
            </div>
          </div>
        );
      case 'manage-admins':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Admins List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-6">System Administrators</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-light-green text-dark-green">
                      <th className="p-3 border-b">Name</th>
                      <th className="p-3 border-b">Email</th>
                      <th className="p-3 border-b">Role</th>
                      <th className="p-3 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length > 0 ? (
                      admins.map(admin => (
                        <tr key={admin.id}>
                          <td className="p-3 border-b">{admin.name}</td>
                          <td className="p-3 border-b">{admin.email}</td>
                          <td className="p-3 border-b"><span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Admin</span></td>
                          <td className="p-3 border-b"><button className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-3 text-center text-gray-500">No admins found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Register Admin Form */}
            <div className="bg-white p-6 rounded-lg shadow-md h-fit">
              <h2 className="text-xl font-bold text-dark-green mb-6">Register New Admin</h2>
              <form className="space-y-4" onSubmit={handleRegisterAdmin}>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={newAdmin.name}
                    onChange={handleAdminInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="Admin Name" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={newAdmin.email}
                    onChange={handleAdminInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="admin@example.com" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={newAdmin.password}
                    onChange={handleAdminInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
                    placeholder="Create Password" 
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-primary-green text-white py-2 rounded font-bold hover:bg-dark-green transition">Create Admin</button>
              </form>
            </div>
          </div>
        );
      case 'view-farmers':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Registered Farmers</h2>
              <button className="bg-primary-green text-white px-4 py-2 rounded hover:bg-dark-green transition text-sm">
                <i className="fas fa-download mr-2"></i> Export List
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-light-green text-dark-green">
                    <th className="p-3 border-b">Name</th>
                    <th className="p-3 border-b">Phone</th>
                    <th className="p-3 border-b">Location</th>
                    <th className="p-3 border-b">Joined Date</th>
                    <th className="p-3 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.length > 0 ? (
                    farmers.map(farmer => (
                      <tr key={farmer.id}>
                        <td className="p-3 border-b">{farmer.name}</td>
                        <td className="p-3 border-b">{farmer.phone || '-'}</td>
                        <td className="p-3 border-b">{farmer.location || '-'}</td>
                        <td className="p-3 border-b">{new Date(farmer.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 border-b"><button className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-3 text-center text-gray-500">No farmers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-dark-green mb-6">System Settings</h2>
            <p className="text-gray-500">Settings configuration will be available here.</p>
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
            <i className="fas fa-tachometer-alt w-6"></i> Dashboard
          </button>
          <button onClick={() => setActiveView('manage-advisors')} className={`w-full flex items-center px-6 py-3 ${activeView === 'manage-advisors' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-users-cog w-6"></i> Manage Advisors
          </button>
          <button onClick={() => setActiveView('manage-admins')} className={`w-full flex items-center px-6 py-3 ${activeView === 'manage-admins' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-user-shield w-6"></i> Manage Admins
          </button>
          <button onClick={() => setActiveView('view-farmers')} className={`w-full flex items-center px-6 py-3 ${activeView === 'view-farmers' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-users w-6"></i> View Farmers
          </button>
          <button onClick={() => setActiveView('settings')} className={`w-full flex items-center px-6 py-3 ${activeView === 'settings' ? 'bg-primary-green text-white border-r-4 border-white' : 'text-green-100 hover:bg-primary-green hover:text-white'}`}>
            <i className="fas fa-cog w-6"></i> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-dark-green">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-dark-green font-medium">Welcome, {user?.name || 'Super Admin'}</span>
            <button onClick={logout} className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50 transition">Logout</button>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;