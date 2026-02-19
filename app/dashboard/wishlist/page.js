'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getProducts } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

const WISHLIST_KEY = 'ivalux_wishlist';

function getWishlistIds() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function toggleWishlist(productId) {
  const ids = getWishlistIds();
  const index = ids.indexOf(productId);
  if (index >= 0) {
    ids.splice(index, 1);
  } else {
    ids.push(productId);
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  return ids;
}

export default function ClientWishlistPage() {
  return (
    <ProtectedClientRoute>
      <ClientWishlistContent />
    </ProtectedClientRoute>
  );
}

function ClientWishlistContent() {
  const { t } = useLanguage();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setWishlistIds(getWishlistIds());
  }, []);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    getProducts()
      .then((all) => {
        const filtered = all.filter((p) => wishlistIds.includes(p.id));
        setProducts(filtered);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  const handleRemove = (productId) => {
    const newIds = toggleWishlist(productId);
    setWishlistIds(newIds);
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-8">My Wishlist</h1>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
            <p className="text-luxury-ivory/60 mb-4">Your wishlist is empty</p>
            <p className="text-luxury-ivory/50 text-sm mb-6">Save your favorite products by clicking the heart icon</p>
            <Link href="/shop">
              <motion.button
                className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Discover Products
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="bg-charcoal/50 border border-luxury-gold/20 rounded-lg overflow-hidden group"
                variants={fadeInUp}
              >
                <Link href={`/shop/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image_url || 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/shop/${product.id}`}>
                    <h3 className="font-serif text-luxury-ivory hover:text-luxury-gold transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <p className="text-luxury-gold">${product.price != null ? product.price : '—'}</p>
                    <div className="flex gap-2">
                      <Link href={`/shop/${product.id}`}>
                        <motion.button
                          className="px-4 py-2 bg-luxury-gold text-luxury-black text-sm font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View
                        </motion.button>
                      </Link>
                      <motion.button
                        onClick={() => handleRemove(product.id)}
                        className="px-4 py-2 border border-red-500/50 text-red-400 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Remove
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
