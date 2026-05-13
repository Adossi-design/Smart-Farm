import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSocket } from '../utils/socket';
import { buildApiUrl } from '../utils/api';

const MessageComposer = ({ conversationId, currentUser }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const body = text.trim();
    if (!body || !currentUser?.id) return;

    setSending(true);
    const socket = getSocket();

    try {
      if (socket?.connected) {
        socket.emit('send_message', { conversationId, body, userId: currentUser.id });
      } else {
        await fetch(buildApiUrl(`/api/conversations/${conversationId}/messages`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify({ body, userId: currentUser.id })
        });
      }
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.typeMessage')}
          rows={1}
          className="flex-1 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 resize-none bg-slate-50 transition-all"
          style={{ maxHeight: '120px', overflowY: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending
            ? <i className="fas fa-spinner fa-spin text-sm"></i>
            : <i className="fas fa-paper-plane text-sm"></i>
          }
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;
