import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { streamAssistant } from '../utils/assistant';

const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content }
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState('');
  const [busy, setBusy] = useState(false);
  const [toolActive, setToolActive] = useState(false);
  const [error, setError] = useState('');

  const listRef = useRef(null);
  const abortRef = useRef(null);
  const greeting = t('chatbot.greeting', "Hi! I'm the Toumaï Assistant. Ask me about products, prices, or how to buy on the marketplace.");

  const scrollToBottom = useCallback(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streaming, toolActive, scrollToBottom]);

  // Stop any in-flight request when the widget closes or unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setStreaming('');
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await streamAssistant({
        messages: nextMessages,
        userName: user?.name,
        locale: i18n.language,
        signal: controller.signal,
        onDelta: (chunk) => setStreaming((prev) => prev + chunk),
        onTool: () => setToolActive(true)
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply || t('chatbot.empty', 'I could not find an answer for that.') }]);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || t('chatbot.error', 'Something went wrong. Please try again.'));
      }
    } finally {
      setBusy(false);
      setToolActive(false);
      setStreaming('');
      abortRef.current = null;
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div dir="ltr" className="fixed bottom-5 right-5 z-[1000] flex flex-col items-end">
      {/* Panel */}
      {open && (
        <div className="mb-3 w-[22rem] max-w-[calc(100vw-2.5rem)] h-[32rem] max-h-[calc(100vh-7rem)] flex flex-col rounded-2xl shadow-2xl border border-emerald-100 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          {/* Header */}
          <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <i className="fas fa-robot"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight">{t('chatbot.title', 'Toumaï Assistant')}</p>
              <p className="text-xs text-emerald-50/90 leading-tight">{t('chatbot.subtitle', 'AI helper • online')}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('common.close', 'Close')}
              className="p-2 rounded-lg hover:bg-white/15 transition"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-3 bg-slate-50 dark:bg-slate-950">
            {/* Greeting bubble */}
            <div className="flex justify-start">
              <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm shadow-sm border border-slate-100 dark:border-slate-700">
                {greeting}
              </div>
            </div>

            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  dir="auto"
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm whitespace-pre-wrap break-words ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-100 dark:border-slate-700'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Live streaming bubble */}
            {streaming && (
              <div className="flex justify-start">
                <div dir="auto" className="max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-sm text-sm shadow-sm whitespace-pre-wrap break-words bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700">
                  {streaming}
                </div>
              </div>
            )}

            {/* Tool / typing indicator */}
            {busy && !streaming && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                  <i className={`fas ${toolActive ? 'fa-magnifying-glass' : 'fa-ellipsis'} fa-fade`}></i>
                  {toolActive ? t('chatbot.searching', 'Searching the catalog…') : t('chatbot.thinking', 'Thinking…')}
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border border-red-100 dark:border-red-800">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t('chatbot.placeholder', 'Ask about products, prices…')}
                className="flex-1 resize-none max-h-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                aria-label={t('chatbot.send', 'Send')}
                className="h-10 w-10 shrink-0 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-center text-slate-400 dark:text-slate-600">{t('chatbot.disclaimer', 'AI can make mistakes. Verify important details.')}</p>
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('chatbot.title', 'Toumaï Assistant')}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-xl flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition"
      >
        <i className={`fas ${open ? 'fa-chevron-down' : 'fa-comment-dots'}`}></i>
      </button>
    </div>
  );
};

export default Chatbot;
