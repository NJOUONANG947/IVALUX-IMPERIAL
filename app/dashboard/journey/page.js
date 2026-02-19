'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function JourneyPage() {
  return (
    <ProtectedClientRoute>
      <JourneyContent />
    </ProtectedClientRoute>
  );
}

function JourneyContent() {
  const { t } = useLanguage();
  const [events, setEvents] = useState([
    { type: 'signup', date: '2024-01-15', title: 'Account Created', icon: '👤' },
    { type: 'diagnostic', date: '2024-01-16', title: 'Beauty Diagnostic Completed', icon: '✨' },
    { type: 'purchase', date: '2024-01-20', title: 'First Purchase', icon: '🛍️', amount: 450 },
    { type: 'consultation', date: '2024-01-25', title: 'Consultation with Sophie', icon: '💬' },
    { type: 'review', date: '2024-02-01', title: 'Product Review Submitted', icon: '⭐' },
    { type: 'subscription', date: '2024-02-05', title: 'Subscription Started', icon: '🔄' },
  ]);

  const eventColors = {
    signup: 'bg-blue-500/20 text-blue-400',
    diagnostic: 'bg-purple-500/20 text-purple-400',
    purchase: 'bg-luxury-gold/20 text-luxury-gold',
    consultation: 'bg-green-500/20 text-green-400',
    review: 'bg-amber-500/20 text-amber-400',
    subscription: 'bg-pink-500/20 text-pink-400',
  };

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-2">My Beauty Journey</h1>
        <p className="text-luxury-ivory/60 mb-12">Track your complete beauty transformation journey</p>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-luxury-gold/20" />

          <div className="space-y-8">
            {events.map((event, idx) => (
              <motion.div
                key={idx}
                className="relative pl-20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 w-4 h-4 bg-luxury-gold rounded-full border-4 border-luxury-black" />

                <div className={`p-6 rounded-lg border ${eventColors[event.type] || 'bg-charcoal/50 border-luxury-gold/20'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{event.icon}</span>
                        <h3 className="text-lg font-serif text-luxury-ivory">{event.title}</h3>
                      </div>
                      <p className="text-luxury-ivory/60 text-sm">{new Date(event.date).toLocaleDateString()}</p>
                      {event.amount && (
                        <p className="text-luxury-gold mt-2 font-medium">${event.amount}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <motion.div
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[
            { label: 'Days Active', value: '45' },
            { label: 'Products Tried', value: '8' },
            { label: 'Consultations', value: '3' },
            { label: 'Points Earned', value: '1,240' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-serif text-luxury-gold">{stat.value}</p>
              <p className="text-sm text-luxury-ivory/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
