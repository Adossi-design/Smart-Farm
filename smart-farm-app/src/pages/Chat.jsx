import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConversationView from '../components/ConversationView';
import ChatList from '../components/ChatList';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../utils/socket';

const ChatPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useSearchParams();
  const conversationId = search.get('conversationId');
  const { user } = useAuth();
  const hasSelectedConversation = Boolean(conversationId);

  useEffect(() => {
    if (user?.id && user?.token) {
      connectSocket({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        user
      });
    }
    return () => {
      // Keep socket connected while on this page
    };
  }, [user]);

  const handleSelectConversation = (id) => {
    setSearch({ conversationId: String(id) });
  };

  const handleBackToList = () => {
    setSearch({});
  };

  return (
    <div className="h-full flex flex-col bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(5,150,105,0.10),_transparent_25%),#f3f7f4] dark:bg-slate-950">
      <div className="flex-1 flex overflow-hidden p-3 sm:p-4 lg:p-5 gap-3">
        <div className={`${hasSelectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[22rem] flex-col overflow-hidden rounded-[2rem] bg-white/90 dark:bg-slate-900/95 border border-emerald-100 dark:border-slate-700 shadow-[0_18px_50px_rgba(16,185,129,0.10)]`}>
          <ChatList
            currentUser={user}
            selectedConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>
        <div className={`${hasSelectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden rounded-[2rem] bg-white/95 dark:bg-slate-900/95 border border-emerald-100 dark:border-slate-700 shadow-[0_18px_50px_rgba(16,185,129,0.10)]`}>
          {conversationId ? (
            <ConversationView conversationId={conversationId} currentUser={user} onBack={handleBackToList} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 bg-[linear-gradient(135deg,rgba(16,185,129,0.06),rgba(255,255,255,0.0))]">
              <div className="text-center max-w-sm px-6">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-slate-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm">
                  <i className="fas fa-message text-2xl"></i>
                </div>
                <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">{t('chat.selectConversation') || 'Select a conversation to start messaging'}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('chat.cleanDashboard') || 'Your chats will appear here with the same clean dashboard style.'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
