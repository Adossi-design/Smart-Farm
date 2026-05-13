import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { connectSocket } from '../utils/socket';
import { buildApiUrl } from '../utils/api';

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ChatList = ({ currentUser, selectedConversationId, onSelectConversation, onUnreadChange }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const headers = useMemo(() => ({
    'Authorization': `Bearer ${currentUser?.token}`
  }), [currentUser?.token]);

  const loadConversations = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.token) return;
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl(`/api/conversations?userId=${currentUser.id}`), { headers });
      const data = await res.json();
      const conversations = data.items || [];
      setItems(conversations);

      const counts = {};
      await Promise.all(conversations.map(async (c) => {
        try {
          const r = await fetch(buildApiUrl(`/api/conversations/${c.id}/unread-count`), { headers });
          const d = await r.json();
          counts[c.id] = d.count || 0;
        } catch {
          counts[c.id] = 0;
        }
      }));
      setUnread(counts);
      // Notify parent of total unread
      if (onUnreadChange) {
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        onUnreadChange(total);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.token, headers, onUnreadChange]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Socket: listen for new messages to update list in real-time
  useEffect(() => {
    if (!currentUser?.id) return;
    const socket = connectSocket({ baseUrl: import.meta.env.VITE_API_BASE_URL, user: currentUser });
    if (!socket) return;

    const onNewMessage = (msg) => {
      setItems(prev => {
        const idx = prev.findIndex(c => String(c.id) === String(msg.conversationId));
        if (idx === -1) {
          loadConversations();
          return prev;
        }
        const updated = [...prev];
        const conv = { ...updated[idx], lastMessage: { body: msg.body, createdAt: msg.createdAt } };
        updated.splice(idx, 1);
        return [conv, ...updated];
      });

      // Increment unread if not the selected conversation and not sent by me
      if (
        String(msg.conversationId) !== String(selectedConversationId) &&
        msg.senderId !== currentUser.id
      ) {
        setUnread(prev => ({ ...prev, [msg.conversationId]: (prev[msg.conversationId] || 0) + 1 }));
      }
    };

    socket.on('new_message', onNewMessage);
    return () => socket.off('new_message', onNewMessage);
  }, [currentUser, selectedConversationId, loadConversations]);

  // Clear unread when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      setUnread(prev => {
        const next = { ...prev, [selectedConversationId]: 0 };
        if (onUnreadChange) {
          const total = Object.values(next).reduce((a, b) => a + b, 0);
          onUnreadChange(total);
        }
        return next;
      });
    }
  }, [selectedConversationId, onUnreadChange]);

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c => {
      const name = c.participants?.find(p => Number(p?.userId) !== Number(currentUser?.id))?.user?.name || c.title || '';
      const product = c.product?.name || '';
      const last = c.lastMessage?.body || '';
      return [name, product, last].some(f => f.toLowerCase().includes(q));
    });
  }, [items, searchQuery, currentUser?.id]);

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-b from-emerald-50/80 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-emerald-100/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('common.messages')}</h1>
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('chat.searchByName')}
            className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        {loading && (
          <div className="p-4 text-center text-slate-400 text-sm">
            <i className="fas fa-spinner fa-spin mr-2"></i>{t('common.loading')}
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <i className="fas fa-inbox text-3xl mb-3 block opacity-40"></i>
            <p className="text-sm">{t('chat.noConversations')}</p>
          </div>
        )}
        {visibleItems.map(c => {
          const other = c.participants?.find(p => Number(p?.userId) !== Number(currentUser?.id));
          const avatar = other?.user?.profileImage
            ? (other.user.profileImage.startsWith('/uploads')
              ? `${import.meta.env.VITE_API_BASE_URL}${other.user.profileImage}`
              : other.user.profileImage)
            : null;
          const name = other?.user?.name || c.title || `Chat #${c.id}`;
          const badge = unread[c.id] || 0;
          const isSelected = String(selectedConversationId) === String(c.id);

          return (
            <button
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={`w-full text-left px-4 py-3 mb-1 rounded-2xl border transition-all flex items-center gap-3 ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-slate-800 dark:border-emerald-700'
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {avatar ? (
                <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover border-2 border-emerald-100 shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`font-semibold text-sm truncate ${badge > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    {formatTime(c.lastMessage?.createdAt || c.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-xs truncate ${badge > 0 ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                    {c.lastMessage?.body || (c.product?.name ? `📦 ${c.product.name}` : t('chat.noMessages'))}
                  </p>
                  {badge > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-emerald-500 text-white text-xs font-bold rounded-full shrink-0">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
