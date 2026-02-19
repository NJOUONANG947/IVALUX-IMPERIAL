'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getOrders, getLoyaltyPoints, getSubscriptions, getNotifications } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp, staggerFast } from '@/lib/motion';

export default function ClientDashboardPage() {
  return (
    <ProtectedClientRoute>
      <ClientDashboardContent />
    </ProtectedClientRoute>
  );
}

function ClientDashboardContent() {
  const { currentUser, profile } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, loyaltyData, subsData, notifsData] = await Promise.all([
        getOrders({ limit: 5 }).catch(() => []),
        getLoyaltyPoints().catch(() => null),
        getSubscriptions({ status: 'active' }).catch(() => []),
        getNotifications({ unread_only: true, limit: 5 }).catch(() => []),
      ]);
      setOrders(ordersData);
      setLoyalty(loyaltyData);
      setSubscriptions(subsData);
      setNotifications(notifsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const displayName = currentUser?.full_name || currentUser?.email || 'Guest';

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-luxury-ivory/60">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-[calc(100vh-200px)] px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-2">My Account</h1>
        <p className="text-luxury-ivory/60 mb-12">Welcome back, {displayName}</p>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Link href="/dashboard/orders" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Orders</p>
          </Link>
          <Link href="/dashboard/appointments" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Appointments</p>
          </Link>
          <Link href="/dashboard/messages" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Messages</p>
            {notifications.length > 0 && (
              <span className="inline-block w-5 h-5 bg-luxury-gold text-luxury-black text-xs rounded-full mt-1">
                {notifications.length}
              </span>
            )}
          </Link>
          <Link href="/metaverse" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Metaverse</p>
          </Link>
          <Link href="/marketplace" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Marketplace</p>
          </Link>
          <Link href="/dashboard/gamification" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Quests</p>
          </Link>
          <Link href="/dashboard/subscriptions" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Subscriptions</p>
          </Link>
          <Link href="/dashboard/invoices" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Invoices</p>
          </Link>
          <Link href="/dashboard/loyalty" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Loyalty</p>
            {loyalty && (
              <span className="text-luxury-ivory/80 text-xs">{loyalty.points || 0} pts</span>
            )}
          </Link>
          <Link href="/dashboard/quests" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Quests</p>
          </Link>
          <Link href="/dashboard/reviews" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">My Reviews</p>
          </Link>
          <Link href="/dashboard/wishlist" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Wishlist</p>
          </Link>
          <Link href="/dashboard/profile" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Profile</p>
          </Link>
          <Link href="/dashboard/notifications" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Notifications</p>
            {notifications.length > 0 && (
              <span className="inline-block w-5 h-5 bg-luxury-gold text-luxury-black text-xs rounded-full mt-1">
                {notifications.length}
              </span>
            )}
          </Link>
          <Link href="/dashboard/journey" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Journey</p>
          </Link>
          <Link href="/shop" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">Shop</p>
          </Link>
          <Link href="/beauty-scanner" className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg text-center hover:bg-luxury-gold/10 transition-colors">
            <p className="text-luxury-gold text-sm mb-1">AI Scanner</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile & Loyalty */}
          <motion.section
            className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-luxury-gold">Profile & Loyalty</h2>
              <Link href="/dashboard/profile" className="text-luxury-gold hover:underline text-sm">Edit</Link>
            </div>
            <div className="space-y-3 text-luxury-ivory/90">
              <p><span className="text-luxury-gold/80">Name:</span> {currentUser?.full_name || profile?.full_name || '—'}</p>
              <p><span className="text-luxury-gold/80">Email:</span> {currentUser?.email || '—'}</p>
              {loyalty && (
                <>
                  <p><span className="text-luxury-gold/80">Points:</span> {loyalty.points?.toLocaleString() || 0}</p>
                  <p><span className="text-luxury-gold/80">Tier:</span> <span className="capitalize">{loyalty.tier || 'bronze'}</span></p>
                  <Link href="/dashboard/loyalty" className="inline-block text-luxury-gold hover:underline text-sm mt-2">View details</Link>
                </>
              )}
            </div>
          </motion.section>

          {/* Active Subscriptions */}
          {subscriptions.length > 0 && (
            <motion.section
              className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Active Subscriptions</h2>
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-luxury-ivory">{sub.products?.name || 'Subscription'}</p>
                      <p className="text-xs text-luxury-ivory/60 capitalize">{sub.plan_type}</p>
                    </div>
                    <p className="text-luxury-gold">${Number(sub.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Recent Orders */}
          <motion.section
            className="lg:col-span-2 bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Recent Orders</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-luxury-ivory/60">Recent Orders</span>
              <Link href="/dashboard/orders" className="text-luxury-gold hover:underline text-sm">View all</Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-luxury-ivory/60 py-4">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                    <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                    <div
                      className="flex flex-wrap justify-between items-center py-4 border-b border-luxury-gold/10 last:border-0 hover:bg-luxury-gold/5 cursor-pointer rounded px-2 -mx-2 transition-colors"
                    >
                    <div>
                      <p className="text-luxury-ivory font-medium">{order.id.slice(0, 8)}...</p>
                      <p className="text-luxury-ivory/60 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-luxury-ivory/60 text-sm mt-1">
                        {order.order_items?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-luxury-gold">${Number(order.total).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'delivered' ? 'bg-luxury-gold/20 text-luxury-gold' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-charcoal text-luxury-ivory/80'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                    </Link>
                ))}
              </div>
            )}
          </motion.section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/shop" className="text-luxury-gold hover:underline">Continue Shopping</Link>
          <Link href="/dashboard/orders" className="text-luxury-gold hover:underline">My Orders</Link>
          <Link href="/dashboard/appointments" className="text-luxury-gold hover:underline">My Appointments</Link>
          <Link href="/dashboard/invoices" className="text-luxury-gold hover:underline">Invoices</Link>
          <Link href="/dashboard/messages" className="text-luxury-gold hover:underline">Messages</Link>
          <Link href="/dashboard/profile" className="text-luxury-gold hover:underline">Profile</Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/metaverse" className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-colors">
            <h3 className="text-xl font-serif text-luxury-ivory mb-2">Metaverse</h3>
            <p className="text-luxury-ivory/70 text-sm">Explore virtual stores, create avatars, and attend events</p>
          </Link>
          <Link href="/marketplace" className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition-colors">
            <h3 className="text-xl font-serif text-luxury-ivory mb-2">Marketplace</h3>
            <p className="text-luxury-ivory/70 text-sm">Shop from verified sellers and distributors</p>
          </Link>
          <Link href="/dashboard/formulations" className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:border-green-500/50 transition-colors">
            <h3 className="text-xl font-serif text-luxury-ivory mb-2">Personalized Formulations</h3>
            <p className="text-luxury-ivory/70 text-sm">Create custom skincare formulations</p>
          </Link>
          <Link href="/dashboard/iot" className="p-6 bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-lg hover:border-orange-500/50 transition-colors">
            <h3 className="text-xl font-serif text-luxury-ivory mb-2">IoT Devices</h3>
            <p className="text-luxury-ivory/70 text-sm">Connect and manage your smart beauty devices</p>
          </Link>
          <Link href="/dashboard/gamification" className="p-6 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg hover:border-yellow-500/50 transition-colors">
            <h3 className="text-xl font-serif text-luxury-ivory mb-2">Beauty Quests</h3>
            <p className="text-luxury-ivory/70 text-sm">Complete quests and earn rewards</p>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
