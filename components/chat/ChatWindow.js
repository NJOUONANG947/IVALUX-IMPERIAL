'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatWindow.module.css';
import { initialChatMessages, suggestedQuestions, aiResponses } from '@/lib/mockData';
import { getProducts } from '@/lib/api';
import { trackProductPlacement } from '@/lib/trackProductPlacement';

export default function ChatWindow({ onClose, isMinimized, onMinimize }) {
  const [messages, setMessages] = useState(initialChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState([]);
  const productsRef = useRef([]);
  useEffect(() => { productsRef.current = products; }, [products]);
  useEffect(() => {
    getProducts().then((p) => { setProducts(p); productsRef.current = p; }).catch(() => {});
  }, []);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('skincare') || lowerMessage.includes('routine') || lowerMessage.includes('dry')) {
      return { content: aiResponses.skincareRoutine, responseType: 'skincareRoutine' };
    }
    if (lowerMessage.includes('recommend') || lowerMessage.includes('product') || lowerMessage.includes('best')) {
      return { content: aiResponses.productRecommendation, responseType: 'productRecommendation' };
    }
    if (lowerMessage.includes('gift') || lowerMessage.includes('present')) {
      return { content: aiResponses.giftIdeas, responseType: 'giftIdeas' };
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return { content: aiResponses.greeting, responseType: 'greeting' };
    }
    if (lowerMessage.includes('add to cart') || lowerMessage.includes('add it') || lowerMessage.includes('add the')) {
      return { content: aiResponses.addToCart, responseType: 'addToCart' };
    }

    return { content: aiResponses.default, responseType: 'default' };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const { content, responseType } = getAIResponse(userMessage.content);
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Traceability: track AI-driven product recommendations (no UI impact)
      const trackingTypes = ['skincareRoutine', 'productRecommendation', 'giftIdeas'];
      const prods = productsRef.current || [];
      if (trackingTypes.includes(responseType) && prods.length > 0) {
        prods.slice(0, 3).forEach((p) => {
          trackProductPlacement({
            productId: p.id,
            placementType: 'chat',
            reason: `Luxy ${responseType} response`,
            confidence: 0.9,
          });
        });
      }
    }, 1500 + Math.random() * 1000);
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  if (isMinimized) {
    return null;
  }

  return (
    <div className={`${styles.chatContainer} flex flex-col h-full`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-luxury-black border-b border-luxury-gold/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luxury-gold to-yellow-600 flex items-center justify-center">
            <span className="text-luxury-black text-sm font-bold">L</span>
          </div>
          <div>
            <h3 className="text-luxury-ivory font-serif text-sm">Luxy</h3>
            <p className="text-luxury-gold text-xs">AI Beauty Consultant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMinimize}
            className="p-2 text-luxury-ivory/60 hover:text-luxury-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-luxury-ivory/60 hover:text-luxury-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area - scroll only here, messages start at top */}
      <div className={`${styles.messagesArea} flex-1 overflow-y-auto chat-scroll`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.messageWrapper} ${styles[message.role]}`}
          >
            <div className={`${styles.messageBubble}`}>
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className={`${styles.messageWrapper} assistant`}>
            <div className={styles.typingIndicator}>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (show when chat is empty or few messages) */}
      {messages.length <= 2 && (
        <div className={styles.suggestedQuestions}>
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(question)}
              className={styles.suggestedQuestion}
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Luxy for beauty advice..."
            className={styles.inputField}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={styles.sendButton}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
