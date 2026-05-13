/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { buildApiUrl } from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [bookmarks, setBookmarks] = useState(() => {
    const storedBookmarks = localStorage.getItem('smartFarmBookmarks');
    return storedBookmarks ? JSON.parse(storedBookmarks) : [];
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/products'));
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('smartFarmBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const readErrorMessage = async (response, fallbackMessage) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.message) return errorData.message;
      if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return errorData.errors.join(', ');
      }
    }

    const rawText = await response.text().catch(() => '');
    return rawText || fallbackMessage;
  };

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
        const message = await readErrorMessage(response, 'Failed to add product');
        return { success: false, message, status: response.status };
      }
    } catch (error) {
      console.error("Error adding product:", error);
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
        const message = await readErrorMessage(response, 'Failed to update product');
        return { success: false, message, status: response.status };
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
        const message = await readErrorMessage(response, 'Failed to delete product');
        return { success: false, message, status: response.status };
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, message: error.message };
    }
  };

  const toggleBookmark = (product) => {
    setBookmarks((currentBookmarks) => {
      const exists = currentBookmarks.some((item) => item.id === product.id);
      if (exists) {
        return currentBookmarks.filter((item) => item.id !== product.id);
      }

      return [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          quantityAvailable: product.quantityAvailable,
          unit: product.unit,
          location: product.location,
          description: product.description,
          image: product.image,
          sellerId: product.sellerId,
          profession: product.profession,
          averageRating: product.averageRating,
          totalReviews: product.totalReviews
        },
        ...currentBookmarks.filter((item) => item.id !== product.id)
      ];
    });
  };

  const isBookmarked = (productId) => bookmarks.some((item) => item.id === productId);

  return (
    <DataContext.Provider value={{ products, bookmarks, addProduct, updateProduct, deleteProduct, toggleBookmark, isBookmarked }}>
      {children}
    </DataContext.Provider>
  );
};