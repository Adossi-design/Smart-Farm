/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { buildApiUrl } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Check local storage for persisted user
    const storedUser = localStorage.getItem('smartFarmUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};

      if (response.ok) {
        setUser(data);
        localStorage.setItem('smartFarmUser', JSON.stringify(data));
        return { success: true, user: data };
      } else {
        // return structured error so callers can display specific messages
        return { success: false, status: response.status, message: data?.message || t('auth.invalidCredentials') };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message };
    }
  };

  const register = async (formData) => {
    try {
      const payload = {
        name: formData.fullName,
        email: formData.email, 
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        location: formData.location
      };

      // Include profession if role is farmer
      if (formData.role === 'farmer' && formData.profession) {
        payload.profession = formData.profession;
      }

      const response = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};

      if (response.ok) {
        setUser(data);
        localStorage.setItem('smartFarmUser', JSON.stringify(data));
        return data;
      } else {
        alert(data.message || t('validation.registrationFailed'));
        return null;
      }
    } catch (error) {
      console.error("Register error:", error);
      alert(`${t('validation.registrationFailed')}: ${error.message}`);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartFarmUser');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('smartFarmUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};