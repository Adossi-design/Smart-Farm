import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';

const RatingModal = ({ sellerId, onClose, onReviewAdded }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert(t('review.ratingPrompt'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sellerId,
          rating,
          comment: comment || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('review.submittedSuccess'));
        onReviewAdded();
      } else {
        alert(data.message || t('review.submitError'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(t('review.submitError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark-green">{t('review.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">{t('review.rating')}</label>
            <div className="flex gap-3 justify-center mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition transform hover:scale-110"
                >
                  <i
                    className={`fas fa-star text-3xl ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  ></i>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600">
                {rating === 1 && t('review.poor')}
                {rating === 2 && t('review.fair')}
                {rating === 3 && t('review.good')}
                {rating === 4 && t('review.veryGood')}
                {rating === 5 && t('review.excellent')}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">{t('review.commentOptional')}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('review.commentPlaceholder')}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary-green resize-none"
              rows="4"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">{comment.length}/500 {t('review.characters')}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
            >
              {t('review.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-primary-green text-white py-2 rounded-lg font-bold hover:bg-dark-green transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? t('review.submitting') : t('review.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
