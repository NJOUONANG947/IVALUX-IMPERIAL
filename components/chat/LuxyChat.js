'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from './ChatWindow';

export default function LuxyChat() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenLuxy = () => setIsOpen(true);
    window.addEventListener('openLuxy', handleOpenLuxy);
    return () => window.removeEventListener('openLuxy', handleOpenLuxy);
  }, []);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Widget Button - hidden when chat open */}
      {!isOpen && (
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-8 right-8 z-[60] w-14 h-14 rounded-full flex items-center justify-center shadow-luxury-lg
          bg-gradient-to-br from-luxury-gold to-amber-700 text-luxury-black
          hover:scale-105 transition-transform border-2 border-luxury-gold/50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <span className="text-xl font-serif font-bold">L</span>
      </motion.button>
      )}

      {/* Chat Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-4 right-4 z-[70] w-[420px] flex flex-col rounded-xl overflow-hidden border border-luxury-gold/30 shadow-2xl bg-luxury-black"
            style={{ height: 'min(700px, calc(100vh - 120px))' }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <ChatWindow
              onClose={handleClose}
              isMinimized={isMinimized}
              onMinimize={handleMinimize}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
