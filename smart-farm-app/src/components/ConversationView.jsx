import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MessageComposer from './MessageComposer';
import { connectSocket } from '../utils/socket';
import { buildApiUrl } from '../utils/api';

const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const formatDateDivider = (date) =>
  new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const ConversationView = ({ conversationId, currentUser, onBack }) => {
  const { t } = useTranslation();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const headers = useMemo(() => (
    currentUser?.token ? { 'Authorization': `Bearer ${currentUser.token}` } : {}
  ), [currentUser?.token]);

  const scrollToBottom = () => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  const markAllRead = useCallback(async () => {
    if (!conversationId || !currentUser?.id) return;
    try {
      await fetch(buildApiUrl(`/api/conversations/${conversationId}/read-all`), {
        method: 'PATCH',
        headers
      });
    } catch (error) {
      console.warn('Failed to mark conversation as read:', error);
    }
  }, [conversationId, currentUser?.id, headers]);

  const loadData = useCallback(async () => {
    if (!conversationId || !currentUser?.id) return;
    setLoading(true);
    try {
      const [convRes, msgRes] = await Promise.all([
        fetch(buildApiUrl(`/api/conversations/${conversationId}`), { headers }),
        fetch(buildApiUrl(`/api/conversations/${conversationId}/messages`), { headers })
      ]);
      const convData = await convRes.json();
      const msgData = await msgRes.json();
      setConversation(convData);
      setMessages(msgData.items || []);
      await markAllRead();
    } catch (err) {
      console.error('Failed to load conversation', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentUser?.id, headers, markAllRead]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket
  useEffect(() => {
    if (!conversationId || !currentUser?.id) return;
    const socket = connectSocket({ baseUrl: import.meta.env.VITE_API_BASE_URL, user: currentUser });
    if (!socket) return;

    socket.emit('join_conversation', { conversationId });

    const onNew = async (msg) => {
      if (!msg || String(msg.conversationId) !== String(conversationId)) return;
      setMessages(prev => {
        if (prev.find(m => String(m.id) === String(msg.id))) return prev;
        return [...prev, msg];
      });
      if (String(msg.senderId) !== String(currentUser.id)) await markAllRead();
    };

    const onRead = ({ conversationId: cid }) => {
      if (String(cid) !== String(conversationId)) return;
      setMessages(prev => prev.map(m =>
        String(m.senderId) === String(currentUser.id) && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m
      ));
    };

    socket.on('new_message', onNew);
    socket.on('conversation_read', onRead);
    return () => {
      socket.off('new_message', onNew);
      socket.off('conversation_read', onRead);
    };
  }, [conversationId, currentUser, markAllRead]);

  if (!conversationId) return null;

  const other = conversation?.participants?.find(p => Number(p?.userId) !== Number(currentUser?.id));
  const otherUser = other?.user;
  const avatar = otherUser?.profileImage
    ? (otherUser.profileImage.startsWith('/uploads')
      ? `${import.meta.env.VITE_API_BASE_URL}${otherUser.profileImage}`
      : otherUser.profileImage)
    : null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-emerald-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 p-2 rounded-xl transition"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        {avatar ? (
          <img src={avatar} alt={otherUser?.name} className="h-10 w-10 rounded-full object-cover border-2 border-emerald-200" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-sm font-bold">
            {(otherUser?.name || 'C').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-slate-900 dark:text-white truncate">
            {otherUser?.name || conversation?.title || 'Conversation'}
          </h2>
          {conversation?.product && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">📦 {conversation.product.name}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        dir="ltr"
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-1 bg-slate-50 dark:bg-slate-950"
      >
        {loading && (
          <div className="text-center py-8 text-slate-400">
            <i className="fas fa-spinner fa-spin text-xl"></i>
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600">
            <i className="fas fa-comment text-2xl mb-2 block opacity-40"></i>
            <p className="text-sm">{t('chat.noMessages')}</p>
          </div>
        )}
        {messages.map((m, idx) => {
          const isOwn = String(m.senderId) === String(currentUser?.id);
          const prevMsg = messages[idx - 1];
          const showDivider = !prevMsg || new Date(prevMsg.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
          const isRead = !!m.readAt;
          const isProductRef = m.metadata?.type === 'product_reference' || (!m.body && m.metadata?.productId);

          return (
            <div key={m.id}>
              {showDivider && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
                    {formatDateDivider(m.createdAt)}
                  </span>
                </div>
              )}
              {isProductRef && conversation?.product ? (
                <div className="flex justify-center my-3">
                  <a
                    href={`/product/${conversation.product.id}`}
                    className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition max-w-xs w-full"
                  >
                    {conversation.product.image ? (
                      <img
                        src={conversation.product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${conversation.product.image}` : conversation.product.image}
                        alt={conversation.product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-emerald-100 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">📦</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Product</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{conversation.product.name}</p>
                      <p className="text-sm text-emerald-600 font-bold">CFA {Number(conversation.product.price || 0).toLocaleString()}</p>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400 shrink-0"></i>
                  </a>
                </div>
              ) : m.body ? (
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    isOwn
                      ? 'bg-emerald-500 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm border border-slate-100 dark:border-slate-700'
                  }`}>
                    <p dir="auto" className="text-sm break-words leading-relaxed">{m.body}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-emerald-100/80' : 'text-slate-400 dark:text-slate-500'}`}>
                      <span className="text-xs">{formatTime(m.createdAt)}</span>
                      {isOwn && (
                        <i className={`fas fa-check-double text-xs ${isRead ? 'text-blue-200' : 'text-emerald-200/60'}`}></i>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="shrink-0">
        <MessageComposer conversationId={conversationId} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ConversationView;
