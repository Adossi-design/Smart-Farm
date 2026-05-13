import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

const BugReportModal = ({ onClose }) => {
  const { success, error: toastError } = useToast();
  const [type, setType] = useState('bug');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const types = [
    { id: 'bug', label: 'Bug / Error' },
    { id: 'ui', label: 'UI Problem' },
    { id: 'feature', label: 'Broken Feature' },
    { id: 'feedback', label: 'Feedback' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      // Store locally as a simple log (no dedicated endpoint needed)
      const reports = JSON.parse(localStorage.getItem('bug_reports') || '[]');
      reports.push({ type, description, url: window.location.href, ts: new Date().toISOString() });
      localStorage.setItem('bug_reports', JSON.stringify(reports.slice(-50)));
      success('Report submitted. Thank you!');
      onClose();
    } catch {
      toastError('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fas fa-bug text-red-500"></i> Report Issue
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {types.map(tp => (
              <button
                key={tp.id}
                type="button"
                onClick={() => setType(tp.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  type === tp.id
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-red-300'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            required
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !description.trim()} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2">
              {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugReportModal;
