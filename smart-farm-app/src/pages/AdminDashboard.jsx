import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getProductCategories } from '../constants/categories';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, farmers: 0, buyers: 0, admins: 0, products: 0, conversations: 0, messages: 0 });
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [adminProfile, setAdminProfile] = useState({ name: '', email: '', password: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${user?.token}` };

      const [statsRes, usersRes, adminsRes, productsRes, convsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/admins`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations`, { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({ ...prev, ...statsData }));
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
        setStats(prev => ({ ...prev, users: usersData.length }));
        const buyerCount = usersData.filter(person => person.role === 'buyer').length;
        const farmerCount = usersData.filter(person => person.role === 'farmer').length;
        setStats(prev => ({ ...prev, buyers: buyerCount, farmers: farmerCount }));
      }
      if (adminsRes.ok) {
        const adminsData = await adminsRes.json();
        setAdmins(adminsData);
        setStats(prev => ({ ...prev, admins: adminsData.length }));
      }
      if (productsRes.ok) setProducts(await productsRes.json());
      if (convsRes.ok) {
        const convsPayload = await convsRes.json();
        const conversationItems = Array.isArray(convsPayload)
          ? convsPayload
          : convsPayload.items || convsPayload.conversations || [];

        const msgCount = conversationItems.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
        setStats(prev => ({ ...prev, conversations: conversationItems.length, messages: msgCount }));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
    setLoading(false);
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [user?.token, navigate, fetchAdminData]);

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({ ...newAdmin, [name]: value });
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/admins`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(newAdmin),
      });
      
      if (response.ok) {
        alert(t('admin.registerSuccess', { name: newAdmin.name }));
        setNewAdmin({ name: '', email: '', password: '' });
        fetchAdminData();
      } else {
        const data = await response.json();
        alert(data.message || t('admin.registerError'));
      }
    } catch (error) {
      console.error('Error registering admin:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const saveAdminProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ name: adminProfile.name || user?.name, email: adminProfile.email || user?.email, ...(adminProfile.password ? { password: adminProfile.password } : {}) })
      });
      if (res.ok) {
        alert(t('profile.profileUpdated'));
        setAdminProfile(p => ({ ...p, password: '' }));
      } else {
        alert(t('profile.profileUpdateFailed'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  };

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    return users.filter((person) => {
      const matchesSearch = !search || [
        person.name,
        person.email,
        person.phone,
        person.location,
        person.profession,
        person.organization,
        person.specialization,
      ].filter(Boolean).some((field) => String(field).toLowerCase().includes(search));

      const matchesRole = userRoleFilter === 'all' || person.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !search || [product.name, product.category, product.location, product.seller?.name]
        .filter(Boolean)
        .some(field => String(field).toLowerCase().includes(search));
      const matchesCategory = productCategoryFilter === 'all' || (product.category || '').toLowerCase() === productCategoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, productCategoryFilter]);
  const categoryOptions = useMemo(() => getProductCategories(products), [products]);

  const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) {
      alert(t('admin.noDataExport'));
      return;
    }
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => {
      const v = String(r[k] ?? '').replace(/"/g, '""');
      return '"' + v + '"';
    }).join(','))).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (title, columns, rows) => {
    if (!rows || !rows.length) {
      alert(t('admin.noDataExport'));
      return;
    }

    const popup = window.open('', '_blank', 'width=1000,height=700');
    if (!popup) {
      alert(t('admin.popupBlocked'));
      return;
    }

    const tableHeader = columns.map((column) => `<th style="border:1px solid #d1d5db;padding:8px;text-align:left;">${column.label}</th>`).join('');
    const tableBody = rows.map((row) => {
      const cells = columns.map((column) => `<td style="border:1px solid #e5e7eb;padding:8px;">${String(row[column.key] ?? '')}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    popup.document.write(`
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 24px; color: #111827;">
          <h1 style="margin: 0 0 8px;">${title}</h1>
          <p style="margin: 0 0 20px; color: #4b5563;">Generated on ${new Date().toLocaleString()}</p>
          <table style="border-collapse: collapse; width: 100%; font-size: 12px;">
            <thead><tr>${tableHeader}</tr></thead>
            <tbody>${tableBody}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const executeDelete = async (endpoint, confirmMessage, successMessage, targetId) => {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t('admin.deleteFailed'));
      }

      alert(successMessage);
      fetchAdminData();

      if (Number(targetId) === Number(user?.id)) {
        logout();
        navigate('/login');
      }
    } catch (error) {
      alert(error.message || t('admin.deleteFailed'));
    }
  };

  const handleDeleteUser = (person) => {
    executeDelete(
      `/api/admin/users/${person.id}`,
      t('admin.deleteUserConfirm', { name: person.name }),
      t('admin.deleteUserSuccess', { name: person.name }),
      person.id
    );
  };

  const handleDeleteAdmin = (adminUser) => {
    executeDelete(
      `/api/admin/admins/${adminUser.id}`,
      t('admin.deleteAdminConfirm', { name: adminUser.name }),
      t('admin.deleteAdminSuccess', { name: adminUser.name }),
      adminUser.id
    );
  };

  const handleDeleteProduct = (product) => {
    executeDelete(
      `/api/admin/products/${product.id}`,
      t('admin.deleteProductConfirm', { name: product.name }),
      t('admin.deleteProductSuccess', { name: product.name }),
      product.id
    );
  };

  // Analytics data — months are translated via i18n keys
  const activityData = [
    { month: t('admin.months.jan'), users: 400, conversations: 240 },
    { month: t('admin.months.feb'), users: 520, conversations: 290 },
    { month: t('admin.months.mar'), users: 680, conversations: 380 },
    { month: t('admin.months.apr'), users: 920, conversations: 520 },
    { month: t('admin.months.may'), users: stats.users || 0, conversations: stats.conversations || 0 },
  ];

  // ML-style demand prediction: weight categories by recency + frequency
  const mlDemandData = useMemo(() => {
    if (!products.length) return [];
    const now = Date.now();
    const scoreMap = {};
    products.forEach((p) => {
      const cat = p.category || t('admin.uncategorized');
      const ageMs = now - new Date(p.createdAt || now).getTime();
      const recencyScore = Math.max(0, 1 - ageMs / (1000 * 60 * 60 * 24 * 90)); // decay over 90 days
      scoreMap[cat] = (scoreMap[cat] || 0) + 1 + recencyScore;
    });
    return Object.entries(scoreMap)
      .map(([name, score]) => ({ name, demand: Math.round(score * 10) }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 6);
  }, [products, t]);

  const latestProducts = [...products]
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    .slice(0, 5);

  const categoryBreakdown = Object.values(
    products.reduce((accumulator, product) => {
      const category = product.category || t('admin.uncategorized');
      if (!accumulator[category]) {
        accumulator[category] = { name: category, count: 0 };
      }
      accumulator[category].count += 1;
      return accumulator;
    }, {})
  ).sort((left, right) => right.count - left.count).slice(0, 5);

  const getRoleLabel = (role) => {
    const normalizedRole = role || 'unknown';
    const roleLabels = {
      admin: t('admin.administrator'),
      buyer: t('register.buyer'),
      farmer: t('register.farmer'),
      seller: t('register.seller'),
      advisor: t('register.advisor'),
      butcher: t('register.butcher'),
      fisher: t('register.fisher'),
      baker: t('register.baker'),
      gardener: t('register.gardener'),
      other: t('register.other'),
      unknown: t('admin.unknown'),
    };

    return roleLabels[normalizedRole] || normalizedRole;
  };

  const roleCounts = useMemo(() => {
    const map = {};
    users.forEach(u => {
      const role = u?.role || 'unknown';
      map[role] = (map[role] || 0) + 1;
    });
    return map;
  }, [users]);

  const userDistribution = Object.keys(roleCounts).length > 0
    ? Object.entries(roleCounts).map(([role, count]) => ({ name: getRoleLabel(role), value: count }))
    : [
        { name: t('admin.usersLabel'), value: stats.users },
        { name: t('admin.farmersLabel'), value: stats.farmers },
        { name: t('admin.buyersLabel'), value: stats.buyers },
        { name: t('admin.adminsLabel'), value: stats.admins },
      ];

  const topRoleEntries = Object.entries(roleCounts).sort((a,b) => b[1] - a[1]).slice(0,3);
  const reportedUsers = useMemo(() => {
    return users.filter(u => {
      if (!u) return false;
      if (Array.isArray(u.reports) && u.reports.length > 0) return true;
      if (typeof u.reportCount === 'number' && u.reportCount > 0) return true;
      if (u.reported === true) return true;
      return false;
    });
  }, [users]);

  const COLORS = ['#10B981', '#06B6D4', '#F59E0B', '#EF4444'];
  const sidebarItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: 'chart-line' },
    { id: 'manage-users', label: t('admin.manageUsers'), icon: 'users-cog' },
    { id: 'manage-admins', label: t('admin.manageAdmins'), icon: 'user-shield' },
    { id: 'view-products', label: t('admin.marketplaceProducts'), icon: 'boxes-stacked' },
    { id: 'profile', label: t('common.profile'), icon: 'user-circle' },
  ];

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                const cards = [];
                // top role cards
                topRoleEntries.forEach(([role, count]) => {
                  cards.push({ label: getRoleLabel(role), value: count, icon: '👥', color: 'from-emerald-600 to-green-600', action: () => setActiveView('manage-users') });
                });
                // ensure products and admins are shown
                cards.push({ label: t('admin.productsListed'), value: stats.products, icon: '📦', color: 'from-lime-500 to-emerald-600', action: () => setActiveView('view-products') });
                cards.push({ label: t('admin.manageAdmins'), value: stats.admins, icon: '🛡️', color: 'from-emerald-500 to-green-700', action: () => setActiveView('manage-admins') });

                return cards.slice(0,4).map((card, idx) => (
                  <div
                    key={idx}
                    onClick={card.action}
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-6 text-white shadow-xl transition-all duration-300 ${card.action ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : ''}`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl">{card.icon}</span>
                        <span className="text-3xl font-bold">{card.value}</span>
                      </div>
                      <p className="text-white/80 font-medium">{card.label}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Charts */}
            <div className="space-y-6">
              {/* Platform Growth — Line Chart */}
              <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                    <i className="fas fa-chart-line text-emerald-700"></i> {t('admin.platformGrowth')}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{t('admin.platformGrowthDesc')}</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" />
                    <XAxis dataKey="month" stroke="#047857" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#047857" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#064E3B' }} />
                    <Legend wrapperStyle={{ fontSize: '13px' }} />
                    <Line type="monotone" dataKey="users" stroke="#059669" strokeWidth={3} name={t('admin.usersLabel')} dot={{ fill: '#059669', r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="conversations" stroke="#0EA5E9" strokeWidth={3} name={t('admin.conversations')} dot={{ fill: '#0EA5E9', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* User Distribution — Pie Chart */}
              <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                    <i className="fas fa-users text-emerald-700"></i> {t('admin.userDistribution')}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{t('admin.userDistributionDesc')}</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={userDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={110}
                        dataKey="value"
                      >
                        {userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#064E3B' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full lg:w-64 shrink-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-emerald-100">
                          <th className="text-left py-2 text-emerald-700 font-semibold">{t('admin.role')}</th>
                          <th className="text-right py-2 text-emerald-700 font-semibold">{t('admin.usersLabel')}</th>
                          <th className="text-right py-2 text-emerald-700 font-semibold">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDistribution.map((entry, index) => {
                          const total = userDistribution.reduce((s, e) => s + e.value, 0);
                          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
                          return (
                            <tr key={entry.name} className="border-b border-emerald-50">
                              <td className="py-2 flex items-center gap-2">
                                <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name}
                              </td>
                              <td className="py-2 text-right font-semibold text-slate-800">{entry.value}</td>
                              <td className="py-2 text-right text-slate-500">{pct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Product Categories — Bar Chart */}
              <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                    <i className="fas fa-boxes-stacked text-emerald-700"></i> {t('admin.productsByCategory')}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{t('admin.productsByCategoryDesc')}</p>
                </div>
                {categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" />
                      <XAxis dataKey="name" stroke="#047857" interval={0} angle={-20} textAnchor="end" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#047857" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#064E3B' }} formatter={(value) => [value, t('admin.productsLabel')]} />
                      <Bar dataKey="count" fill="#059669" radius={[8, 8, 0, 0]} name={t('admin.productsLabel')} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 text-emerald-700">
                    {t('common.noData')}
                  </div>
                )}
              </div>

              {/* ML Demand Prediction */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-green-800 p-6 shadow-lg text-white">
                <div className="mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <i className="fas fa-brain"></i> {t('admin.mlDemandTitle')}
                  </h3>
                  <p className="text-emerald-100 text-sm mt-1">{t('admin.mlDemandDesc')}</p>
                </div>
                {mlDemandData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={mlDemandData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" horizontal={false} />
                      <XAxis type="number" stroke="rgba(255,255,255,0.7)" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.8)' }} />
                      <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.7)" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.9)' }} width={90} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#064E3B', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
                        formatter={(value) => [value, t('admin.mlDemandScore')]}
                      />
                      <Bar dataKey="demand" fill="rgba(255,255,255,0.85)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/30 text-emerald-100">
                    {t('common.noData')}
                  </div>
                )}
                <p className="text-xs text-emerald-200 mt-3">{t('admin.mlDemandNote')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Recent Products */}
              <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-emerald-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-box-open text-emerald-700"></i> {t('seller.myProducts')}
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {latestProducts.length > 0 ? latestProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="flex w-full items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-left transition hover:bg-emerald-100"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-sm">
                        <i className="fas fa-seedling"></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-emerald-900">{product.name}</p>
                        <p className="truncate text-sm text-emerald-700">{product.category || t('admin.uncategorized')} · {product.location || t('admin.noLocationSet')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-800">{product.price}</p>
                        <p className="text-xs text-emerald-700">{product.seller?.name || t('buyer.seller')}</p>
                      </div>
                    </button>
                  )) : (
                    <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 text-emerald-700">
                      {t('common.noData')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'manage-users':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm overflow-hidden">
              <div className="flex flex-wrap gap-3 mb-6 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                  <i className="fas fa-users-cog text-emerald-700"></i> {t('admin.manageUsers')}
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder={t('admin.searchUsersPlaceholder')}
                    className="w-full sm:w-56 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(event) => setUserRoleFilter(event.target.value)}
                    className="w-full sm:w-36 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                  >
                    <option value="all">{t('buyer.allCategories')}</option>
                    <option value="admin">{t('register.seller')} (Admin)</option>
                    <option value="buyer">{t('register.buyer')}</option>
                    <option value="farmer">{t('register.farmer')}</option>
                    <option value="seller">{t('register.seller')}</option>
                    <option value="butcher">{t('register.butcher')}</option>
                    <option value="fisher">{t('register.fisher')}</option>
                    <option value="baker">{t('register.baker')}</option>
                    <option value="gardener">{t('register.gardener')}</option>
                    <option value="other">{t('register.other')}</option>
                  </select>
                  <button onClick={() => exportToCSV('users.csv', filteredUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, createdAt: u.createdAt })))} className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-all duration-200 text-sm">
                    <i className="fas fa-download mr-1"></i> {t('admin.exportCsv')}
                  </button>
                  <button onClick={() => exportToPDF('Users Report', [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: t('admin.name') },
                    { key: 'email', label: t('admin.email') },
                    { key: 'role', label: t('admin.role') },
                    { key: 'phone', label: t('buyer.phone') },
                    { key: 'createdAt', label: t('admin.registeredAt') },
                  ], filteredUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '-', createdAt: formatDateTime(u.createdAt) })))} className="px-3 py-2 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg font-medium transition-all duration-200 text-sm">
                    <i className="fas fa-file-pdf mr-1"></i> {t('admin.exportPdf')}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="min-w-[640px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-emerald-100">
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.name')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.email')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.role')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('buyer.phone')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.registeredAt')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? filteredUsers.map(person => (
                      <tr key={person.id} className="border-b border-emerald-50 hover:bg-emerald-50 transition-colors">
                        <td className="px-4 py-3 text-slate-900">{person.name}</td>
                        <td className="px-4 py-3 text-slate-600">{person.email}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                            person.role === 'admin' ? 'bg-purple-100 text-purple-800'
                            : person.role === 'buyer' ? 'bg-blue-100 text-blue-800'
                            : person.role === 'farmer' ? 'bg-lime-100 text-lime-800'
                            : person.role === 'butcher' ? 'bg-red-100 text-red-800'
                            : person.role === 'fisher' ? 'bg-cyan-100 text-cyan-800'
                            : person.role === 'baker' ? 'bg-amber-100 text-amber-800'
                            : person.role === 'gardener' ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-700'
                          }`}>
                            {getRoleLabel(person.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{person.phone || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTime(person.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteUser(person)} className="text-emerald-700 hover:text-emerald-900 transition-colors">
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-emerald-700">
                          {users.length === 0 ? t('admin.noUsers') : t('admin.noUsersFiltered')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-pie text-emerald-700"></i> {t('admin.platformSnapshot')}
                </h3>
                <div className="space-y-3 text-sm text-emerald-900">
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-emerald-100"><span>{t('admin.usersLabel')}</span><span className="font-semibold">{stats.users}</span></div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-emerald-100"><span>{t('admin.farmersLabel')}</span><span className="font-semibold">{stats.farmers}</span></div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-emerald-100"><span>{t('admin.buyersLabel')}</span><span className="font-semibold">{stats.buyers}</span></div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-emerald-100"><span>{t('admin.adminsLabel')}</span><span className="font-semibold">{stats.admins}</span></div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-emerald-100"><span>{t('admin.productsLabel')}</span><span className="font-semibold">{stats.products}</span></div>
                </div>
              </div>

                <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-flag text-emerald-700"></i> {t('admin.reportedUsers')}
                  </h3>
                  {reportedUsers.length > 0 ? (
                    <div className="space-y-3">
                      {reportedUsers.slice(0,5).map(u => (
                        <div key={u.id} className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 border border-emerald-100">
                          <div className="min-w-0">
                            <p className="font-semibold text-emerald-900 truncate">{u.name || u.email}</p>
                            <p className="text-sm text-emerald-700 truncate">{u.email || '-'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-800">{(Array.isArray(u.reports) && u.reports.length) || u.reportCount || '-'}</p>
                            <p className="text-xs text-emerald-700">{t('admin.reports')}</p>
                          </div>
                        </div>
                      ))}
                      <div className="text-sm text-emerald-700">{t('admin.reportedUsersNote')}</div>
                    </div>
                  ) : (
                    <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 text-emerald-700">
                      {t('admin.noReportedUsers')}
                    </div>
                  )}
                </div>

              <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-comments text-emerald-700"></i> {t('admin.messagingCoverage')}
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  {t('admin.messagingCoverageDesc')}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                    <p className="text-emerald-700">{t('admin.conversations')}</p>
                    <p className="text-lg font-bold text-emerald-900">{stats.conversations}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                    <p className="text-emerald-700">{t('admin.messages')}</p>
                    <p className="text-lg font-bold text-emerald-900">{stats.messages}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'view-products':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm overflow-hidden">
              <div className="flex flex-wrap gap-2 items-center mb-6">
                <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2 w-full sm:w-auto">
                  <i className="fas fa-boxes-stacked text-emerald-700"></i> {t('admin.marketplaceProducts')}
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={t('admin.searchProductsPlaceholder')}
                    className="w-full sm:w-48 px-4 py-2 bg-white border border-emerald-200 rounded-lg text-slate-700 placeholder-slate-500 text-sm"
                  />
                  <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="px-4 py-2 bg-white border border-emerald-200 rounded-lg text-slate-700 text-sm">
                    <option value="all">{t('buyer.allCategories')}</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button onClick={() => exportToCSV('products.csv', filteredProducts.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, quantity: p.quantityAvailable ?? p.quantity, seller: p.seller?.name })))} className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-all duration-200 shadow-sm text-sm">
                    <i className="fas fa-download mr-1"></i> {t('admin.exportCsv')}
                  </button>
                  <button onClick={() => exportToPDF('Products Report', [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: t('admin.product') },
                    { key: 'category', label: t('seller.category') },
                    { key: 'price', label: t('seller.price') },
                    { key: 'quantity', label: t('admin.stock') },
                    { key: 'seller', label: t('buyer.seller') },
                    { key: 'listedAt', label: t('admin.listedAt') },
                  ], filteredProducts.map(p => ({ id: p.id, name: p.name, category: p.category || '-', price: p.price || '-', quantity: `${p.quantityAvailable ?? p.quantity ?? '-'} ${p.unit || ''}`.trim(), seller: p.seller?.name || t('admin.unknown'), listedAt: formatDateTime(p.createdAt) })))} className="px-3 py-2 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg font-medium transition-all duration-200 text-sm">
                    <i className="fas fa-file-pdf mr-1"></i> {t('admin.exportPdf')}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="min-w-[700px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-emerald-100">
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.product')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('seller.category')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('seller.price')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.stock')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('buyer.seller')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.listedAt')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? filteredProducts.map(product => (
                      <tr key={product.id} className="border-b border-emerald-50 hover:bg-emerald-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500">{product.location || t('admin.noLocationSet')}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{product.category || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{product.price}</td>
                        <td className="px-4 py-3 text-slate-600">{product.quantityAvailable ?? product.quantity ?? '-' } {product.unit || ''}</td>
                        <td className="px-4 py-3 text-slate-600">{product.seller?.name || t('admin.unknown')}</td>
                        <td className="px-4 py-3">
                          <span className="text-slate-600">{formatDateTime(product.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3 flex items-center gap-3">
                          <button onClick={() => navigate(`/product/${product.id}`)} className="text-emerald-700 hover:text-emerald-900 transition-colors font-medium">
                            {t('admin.view')}
                          </button>
                          <button onClick={() => handleDeleteProduct(product)} className="text-emerald-700 hover:text-emerald-900 transition-colors">
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-emerald-700">
                          {t('admin.noProducts')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-seedling text-emerald-700"></i> {t('admin.inventoryHealth')}
                </h3>
                <div className="space-y-3 text-sm text-emerald-900">
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-emerald-100"><span>{t('admin.totalProducts')}</span><span className="font-semibold">{stats.products}</span></div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-emerald-100"><span>{t('admin.categories')}</span><span className="font-semibold">{categoryBreakdown.length}</span></div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-emerald-100"><span>{t('admin.latestListings')}</span><span className="font-semibold">{latestProducts.length}</span></div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-comments text-emerald-700"></i> {t('admin.buyerContactFlow')}
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  {t('admin.buyerContactFlowDesc')}
                </p>
              </div>
            </div>
          </div>
        );

      case 'manage-admins':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Admins List */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <i className="fas fa-user-shield text-emerald-700"></i> {t('admin.systemAdministrators')}
              </h2>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="min-w-[500px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-emerald-100">
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.name')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.email')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.role')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.registeredAt')}</th>
                      <th className="px-4 py-3 text-emerald-800 font-semibold">{t('admin.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length > 0 ? (
                      admins.map(admin => (
                        <tr key={admin.id} className="border-b border-emerald-50 hover:bg-emerald-50 transition-colors">
                          <td className="px-4 py-3 text-slate-900">{admin.name}</td>
                          <td className="px-4 py-3 text-slate-600">{admin.email}</td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">{t('admin.admin')}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{formatDateTime(admin.createdAt)}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDeleteAdmin(admin)} className="text-emerald-700 hover:text-emerald-900 transition-colors">
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-emerald-700">
                          {t('admin.noAdminsRegistered')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Register Admin Form */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 shadow-sm h-fit">
              <h2 className="text-xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <i className="fas fa-user-plus text-emerald-700"></i> {t('admin.registerAdminTitle')}
              </h2>
              <form className="space-y-4" onSubmit={handleRegisterAdmin}>
                <div>
                  <label className="block text-emerald-800 font-medium mb-2 text-sm">{t('admin.fullName')}</label>
                  <input 
                    type="text" 
                    name="name"
                    value={newAdmin.name}
                    onChange={handleAdminInputChange}
                    className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                    placeholder={t('admin.adminNamePlaceholder')} 
                    required
                  />
                </div>
                <div>
                  <label className="block text-emerald-800 font-medium mb-2 text-sm">{t('admin.email')}</label>
                  <input 
                    type="email" 
                    name="email"
                    value={newAdmin.email}
                    onChange={handleAdminInputChange}
                    className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                    placeholder="admin@example.com" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-emerald-800 font-medium mb-2 text-sm">{t('register.password')}</label>
                  <input 
                    type="password" 
                    name="password"
                    value={newAdmin.password}
                    onChange={handleAdminInputChange}
                    className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                    placeholder={t('buyer.createPassword')} 
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg font-bold transition-all duration-200 shadow-sm">
                  {t('admin.createAdmin')}
                </button>
              </form>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
              <i className="fas fa-user-circle text-emerald-700"></i> {t('common.profile')}
            </h2>
            <div className="rounded-2xl bg-white border border-emerald-100 p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center text-2xl font-bold shadow">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">{t('admin.administrator')}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-emerald-800 mb-2">{t('admin.name')}</label>
                <input type="text" value={adminProfile.name || user?.name || ''} onChange={e => setAdminProfile(p => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-emerald-800 mb-2">{t('admin.email')}</label>
                <input type="email" value={adminProfile.email || user?.email || ''} onChange={e => setAdminProfile(p => ({ ...p, email: e.target.value }))} className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-emerald-800 mb-2">{t('profile.newPassword')}</label>
                <input type="password" value={adminProfile.password || ''} onChange={e => setAdminProfile(p => ({ ...p, password: e.target.value }))} placeholder={t('profile.passwordHint')} className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button onClick={saveAdminProfile} disabled={savingProfile} className="w-full rounded-lg bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-60">
                {savingProfile ? t('profile.saving') : t('profile.saveChanges')}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-green-50 text-slate-900 overflow-hidden">
      {/* Header — fixed at top */}
      <header className="shrink-0 z-50 border-b border-emerald-200 bg-white/95 backdrop-blur-md shadow-sm shadow-emerald-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <i className="fas fa-leaf text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-700">
              Toumaï Marketplace Admin
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-emerald-800 font-semibold">{user?.name || t('admin.administrator')}</p>
              <p className="text-emerald-700/80 text-sm">{t('admin.adminAccount')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Below header: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — fixed, never scrolls */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-emerald-200 bg-emerald-700/95">
          <nav className="flex-1 overflow-y-auto p-6 space-y-3">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-white text-emerald-800 shadow-lg'
                    : 'text-emerald-50 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className={`fas fa-${item.icon}`}></i>
                {item.label}
              </button>
            ))}
          </nav>
          {/* Logout at bottom of sidebar */}
          <div className="shrink-0 p-4 border-t border-emerald-600">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-emerald-50 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <i className="fas fa-sign-out-alt"></i>
              {t('common.logout')}
            </button>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden shrink-0 border-b border-emerald-200 bg-gradient-to-r from-emerald-700 to-green-700 px-4 py-3 shadow-md">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-white text-emerald-800 shadow-lg'
                    : 'border border-white/25 bg-emerald-500/20 text-white hover:bg-white/15'
                }`}
              >
                <i className={`fas fa-${item.icon} mr-2`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content — only this scrolls */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;