'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { getConversations, getMessages, sendMessage, markMessageRead } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      const interval = setInterval(() => fetchMessages(selectedUserId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].user_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const data = await getMessages(userId);
      setMessages(data);
      // Mark as read
      data.filter(m => !m.read_at && m.receiver_id === currentUser?.id).forEach(m => {
        markMessageRead(m.id).catch(() => {});
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;
    try {
      await sendMessage({ receiver_id: selectedUserId, content: newMessage.trim() });
      setNewMessage('');
      fetchMessages(selectedUserId);
    } catch (err) {
      alert(err.message);
    }
  };

  const selectedConversation = conversations.find(c => c.user_id === selectedUserId);

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-8">Messages</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="bg-charcoal/50 border border-luxury-gold/20 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-luxury-gold/20">
              <h2 className="text-lg font-serif text-luxury-gold">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.user_id}
                  onClick={() => setSelectedUserId(conv.user_id)}
                  className={`w-full p-4 text-left border-b border-luxury-gold/10 hover:bg-luxury-black/50 transition-colors ${
                    selectedUserId === conv.user_id ? 'bg-luxury-gold/10' : ''
                  }`}
                >
                  <p className="text-luxury-ivory font-medium">{conv.user?.full_name || conv.user_id}</p>
                  <p className="text-xs text-luxury-ivory/50">{conv.user?.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 bg-charcoal/50 border border-luxury-gold/20 rounded-lg flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-luxury-gold/20">
                  <p className="text-luxury-ivory font-medium">
                    {selectedConversation.user?.full_name || selectedUserId}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender_id === currentUser?.id
                            ? 'bg-luxury-gold text-luxury-black'
                            : 'bg-luxury-black/50 text-luxury-ivory'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-luxury-gold/20 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-luxury-gold text-luxury-black font-medium"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-luxury-ivory/60">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
