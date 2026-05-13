import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';

const ReportModal = ({ reportedSellerId, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    t('report.reasonScam'),
    t('report.reasonCounterfeit'),
    t('report.reasonQuality'),
    t('report.reasonNonDelivery'),
    t('report.reasonMisrepresented'),
    t('report.reasonAbusive'),
    t('report.reasonOther')
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason || !description) {
      alert(t('validation.required'));
      return;
    }

    if (description.length < 20) {
      alert(t('report.descriptionPlaceholder'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/reports'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reportedSellerId,
          reason,
          description
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('report.success'));
        onClose();
      } else {
        alert(data.message || t('report.error'));
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(t('report.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <i className="fas fa-flag"></i> {t('report.title')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none">&times;</button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-amber-800 leading-relaxed">
            <i className="fas fa-exclamation-triangle mr-2 text-amber-500"></i>
            {t('report.alert')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">{t('report.reasonLabel')}</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 bg-gray-50 text-gray-800"
            >
              <option value="">{t('report.selectReason')}</option>
              {reasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">{t('report.descriptionLabel')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.descriptionPlaceholder')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-gray-50 text-gray-800"
              rows="5"
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {description.length}/1000 {t('review.characters')}
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              {t('report.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><i className="fas fa-spinner fa-spin"></i> {t('report.submitting')}</> : <><i className="fas fa-paper-plane"></i> {t('report.submit')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
