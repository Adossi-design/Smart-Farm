import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';

const ContactButton = ({ product, label, className = '' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/conversations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          productId: product.id,
          participantIds: [product.sellerId]
        })
      });

      if (!res.ok) return;
      const conv = await res.json();

      // Navigate to the appropriate dashboard messages tab with conversation pre-selected
      const role = user.role;
      if (role === 'buyer') {
        navigate(`/buyer?tab=messages&conversationId=${conv.id}`);
      } else if (role === 'farmer' || role === 'seller') {
        navigate(`/seller?tab=messages&conversationId=${conv.id}`);
      } else {
        navigate(`/chat?conversationId=${conv.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className={`flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-60 ${className}`}
    >
      {loading
        ? <i className="fas fa-spinner fa-spin"></i>
        : <i className="fas fa-comment"></i>
      }
      {label || t('buyer.talkToSeller')}
    </button>
  );
};

export default ContactButton;
