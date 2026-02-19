'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function EmployeeNotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === 'unread' ? { unread_only: true } : {};
      const data = await getNotifications(params);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = { order: '🛍️', appointment: '📅', message: '💬', quest: '🎮', points: '⭐', subscription: '🔄', review: '⭐', default: '🔔' };
    return icons[type] || icons.default;
  };

  if (loading) return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Notifications</h1>
          <div className="flex gap-4">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory">
              <option value="all">All</option>
              <option value="unread">Unread</option>
            </select>
            {notifications.some((n) => !n.is_read) && (
              <motion.button onClick={handleMarkAllRead} className="px-4 py-2 border border-luxury-gold/50 text-luxury-gold text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Mark All Read
              </motion.button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-luxury-ivory/60">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                className={`bg-charcoal/50 border p-6 rounded-lg cursor-pointer transition-colors ${notification.is_read ? 'border-luxury-gold/20' : 'border-luxury-gold/50 bg-luxury-gold/5'}`}
                variants={fadeInUp}
                onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{getNotificationIcon(notification.notification_type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif text-luxury-ivory">{notification.title}</h3>
                      {!notification.is_read && <span className="w-2 h-2 bg-luxury-gold rounded-full" />}
                    </div>
                    <p className="text-luxury-ivory/80 mb-2">{notification.message}</p>
                    <p className="text-luxury-ivory/40 text-xs">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
