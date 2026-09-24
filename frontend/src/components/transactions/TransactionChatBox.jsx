import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Send, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const TransactionChatBox = ({ transactionId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await apiClient(`/transactions/${transactionId}/messages`);
      if (res?.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      // Ignore background poll errors
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    // Poll every 5 seconds for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [transactionId]);

  // Scroll ONLY the internal chat container down, never the whole window/page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await apiClient(`/transactions/${transactionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: messageText })
      });

      if (res?.data?.message) {
        setMessages((prev) => [...prev, res.data.message]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send message.');
      setInputText(messageText); // restore text on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="paper-card overflow-hidden flex flex-col h-[420px] shadow-sm">
      {/* Header */}
      <div className="p-3.5 px-4 bg-paper-sand/50 dark:bg-paper-sandDark/30 border-b border-paper-sand dark:border-paper-sandDark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-terracotta" />
          <h4 className="text-xs font-bold text-ink dark:text-ink-dark uppercase tracking-wider">
            Exchange Chat & Coordination
          </h4>
        </div>
        <button
          onClick={fetchMessages}
          title="Refresh chat"
          className="p-1 text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message History */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-paper-light/50 dark:bg-paper-dark/50"
      >
        {loading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-ink-muted dark:text-ink-darkMuted">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="w-8 h-8 text-paper-sand dark:text-paper-sandDark mb-2" />
            <p className="text-xs font-semibold text-ink-muted dark:text-ink-darkMuted">
              No messages yet.
            </p>
            <p className="text-[11px] text-ink-muted/80 dark:text-ink-darkMuted/80 mt-0.5">
              Coordinate meeting times and handover details here.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-ink-muted dark:text-ink-darkMuted mb-0.5 ml-1">
                    {msg.sender?.name?.split(' ')[0] || 'Peer'}
                  </span>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words shadow-sm ${
                    isMe
                      ? 'bg-terracotta text-white rounded-br-xs'
                      : 'bg-white dark:bg-paper-cardDark text-ink dark:text-ink-dark border border-paper-sand dark:border-paper-sandDark rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-ink-muted/70 dark:text-ink-darkMuted/70 mt-0.5 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Sender Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 px-3 bg-white dark:bg-paper-cardDark border-t border-paper-sand dark:border-paper-sandDark flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Type a message to your peer..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 text-xs py-2 px-3 rounded-lg border border-paper-sand dark:border-paper-sandDark bg-paper-light/50 dark:bg-paper-dark/50 text-ink dark:text-ink-dark focus:outline-none focus:ring-1 focus:ring-terracotta"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="p-2 rounded-lg bg-terracotta text-white hover:bg-terracotta-dark disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
