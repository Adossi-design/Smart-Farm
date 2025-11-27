import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { buildApiUrl } from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [advice, setAdvice] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/products'));
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchAdvice = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/advice'));
      const data = await response.json();
      setAdvice(data);
    } catch (error) {
      console.error("Error fetching advice:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAdvice();
  }, []);

  const addProduct = async (productData) => {
    try {
      const token = user?.token;
      if (!token) return { success: false, message: "Not authenticated" };

      const isFormData = productData instanceof FormData;
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(buildApiUrl('/api/products'), {
        method: 'POST',
        headers: headers,
        body: isFormData ? productData : JSON.stringify(productData),
      });
      
      if (response.ok) {
        fetchProducts(); // Refresh list
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData.message || "Failed to add product" };
      }
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false, message: error.message };
    }
  };

  const addAdvice = async (newAdvice) => {
    try {
      const token = user?.token;
      if (!token) return { success: false, message: "Not authenticated" };

      const isFormData = newAdvice instanceof FormData;

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(buildApiUrl('/api/advice'), {
        method: 'POST',
        headers: headers,
        body: isFormData ? newAdvice : JSON.stringify(newAdvice),
      });

      if (response.ok) {
        fetchAdvice(); // Refresh list
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData.message || "Failed to add advice" };
      }
    } catch (error) {
      console.error("Error adding advice:", error);
      return { success: false, message: error.message };
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const token = user?.token;
      if (!token) return { success: false, message: "Not authenticated" };

      const isFormData = productData instanceof FormData;
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(buildApiUrl(`/api/products/${id}`), {
        method: 'PUT',
        headers: headers,
        body: isFormData ? productData : JSON.stringify(productData),
      });
      
      if (response.ok) {
        fetchProducts(); // Refresh list
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData.message || "Failed to update product" };
      }
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, message: error.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const token = user?.token;
      if (!token) return { success: false, message: "Not authenticated" };

      const response = await fetch(buildApiUrl(`/api/products/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchProducts(); // Refresh list
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData.message || "Failed to delete product" };
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, message: error.message };
    }
  };

  return (
    <DataContext.Provider value={{ products, advice, addProduct, addAdvice, updateProduct, deleteProduct }}>
      {children}
    </DataContext.Provider>
  );
};