'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getMetaverseStores, getVirtualEvents, getUserAvatars, getDigitalLooks } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function MetaversePage() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [stores, setStores] = useState([]);
  const [events, setEvents] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      fetchPublicData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, e, a, l] = await Promise.all([
        getMetaverseStores({ is_active: true }),
        getVirtualEvents({ upcoming_only: true, is_public: true }),
        getUserAvatars(),
        getDigitalLooks({ is_public: true, limit: 10 }),
      ]);
      setStores(s || []);
      setEvents(e || []);
      setAvatars(a || []);
      setLooks(l || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      const [s, e] = await Promise.all([
        getMetaverseStores({ is_active: true }),
        getVirtualEvents({ upcoming_only: true, is_public: true }),
      ]);
      setStores(s || []);
      setEvents(e || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-8">Metaverse & Digital Beauty</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Virtual Stores</h2>
            <div className="space-y-3">
              {stores.length === 0 ? (
                <p className="text-luxury-ivory/60">No stores available</p>
              ) : (
                stores.map((store) => (
                  <div key={store.id} className="p-4 bg-luxury-black/50 rounded border border-luxury-gold/10">
                    <p className="text-luxury-ivory font-medium">{store.store_name}</p>
                    <p className="text-luxury-ivory/60 text-sm capitalize">{store.platform}</p>
                    {store.store_url && (
                      <a
                        href={store.store_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-luxury-gold hover:underline text-sm mt-2 inline-block"
                      >
                        Visit Store →
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.section>

          <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-luxury-ivory/60">No upcoming events</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="p-4 bg-luxury-black/50 rounded border border-luxury-gold/10">
                    <p className="text-luxury-ivory font-medium">{event.event_name}</p>
                    <p className="text-luxury-ivory/60 text-sm capitalize">{event.event_type.replace('_', ' ')}</p>
                    <p className="text-luxury-ivory/50 text-xs mt-1">
                      {new Date(event.event_date).toLocaleString()} · {event.platform}
                    </p>
                    {isAuthenticated && (
                      <Link
                        href={`/metaverse/events/${event.id}`}
                        className="text-luxury-gold hover:underline text-sm mt-2 inline-block"
                      >
                        Attend Event →
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>

        {isAuthenticated && (
          <>
            <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg mb-8" variants={fadeInUp}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif text-luxury-gold">My Avatars</h2>
                <Link href="/metaverse/avatars/create" className="text-luxury-gold hover:underline text-sm">
                  Create Avatar →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {avatars.length === 0 ? (
                  <p className="text-luxury-ivory/60 col-span-full">No avatars yet. Create one to get started.</p>
                ) : (
                  avatars.map((avatar) => (
                    <div key={avatar.id} className="p-4 bg-luxury-black/50 rounded border border-luxury-gold/10">
                      <p className="text-luxury-ivory font-medium">{avatar.avatar_name}</p>
                      <Link href={`/metaverse/avatars/${avatar.id}`} className="text-luxury-gold hover:underline text-sm mt-2 inline-block">
                        Edit →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </motion.section>

            <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif text-luxury-gold">Digital Looks</h2>
                <Link href="/metaverse/looks/create" className="text-luxury-gold hover:underline text-sm">
                  Create Look →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {looks.length === 0 ? (
                  <p className="text-luxury-ivory/60 col-span-full">No looks yet. Create one to get started.</p>
                ) : (
                  looks.map((look) => (
                    <div key={look.id} className="p-4 bg-luxury-black/50 rounded border border-luxury-gold/10">
                      {look.preview_image_url && (
                        <div className="aspect-square bg-charcoal/50 rounded mb-2 overflow-hidden">
                          <img src={look.preview_image_url} alt={look.look_name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-luxury-ivory font-medium text-sm">{look.look_name}</p>
                      {look.is_nft && <span className="text-luxury-gold text-xs">NFT</span>}
                    </div>
                  ))
                )}
              </div>
            </motion.section>
          </>
        )}
      </div>
    </motion.div>
  );
}
