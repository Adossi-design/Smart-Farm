import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setUser(data);
        localStorage.setItem('smartFarmUser', JSON.stringify(data));
        return data;
      } else {
        console.error(data.message);
        return null;
      }
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  const register = async (formData) => {
    try {
      const payload = {
        name: formData.fullName,
        email: formData.email, 
        password: formData.password,
        role: 'farmer',
        phone: formData.phone,
        location: formData.location
      };

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (response.ok) {
        setUser(data);
        localStorage.setItem('smartFarmUser', JSON.stringify(data));
        return data;
      } else {
        alert(data.message);
        return null;
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Registration failed: " + error.message);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartFarmUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};