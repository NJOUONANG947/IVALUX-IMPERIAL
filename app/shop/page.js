'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getProducts } from '@/lib/api';
import { fadeInUp, staggerFast } from '@/lib/motion';
import { useLanguage } from '@/lib/i18n';

export default function ShopPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter((p) => (p.category || '').toLowerCase() === categoryFilter.toLowerCase());
    }
    setFilteredProducts(result);
  }, [products, search, categoryFilter]);

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

  if (loading) {
    return (
      <motion.div
        className="min-h-[calc(100vh-200px)] px-6 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="h-12 w-64 bg-charcoal/50 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-charcoal/50 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-charcoal/50 rounded animate-pulse" />
                <div className="h-6 w-full bg-charcoal/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }
  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6">
        <p className="text-amber-400 mb-4">{error}</p>
        <Link href="/" className="text-luxury-gold hover:underline">{t('auth.backToHome')}</Link>
      </div>
    );
  }

  const IVALUX_SITE = 'https://ivaluximperial.com';

  return (
    <motion.div
      className="min-h-[calc(100vh-200px)] px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Banner */}
        <motion.div
          className="mb-10 p-6 bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-luxury-ivory/90 mb-4">
            {t('shop.banner')}
          </p>
          <motion.a
            href={IVALUX_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-luxury-gold text-luxury-black font-medium"
            whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(201, 169, 97, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            {t('shop.viewSite')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </motion.a>
        </motion.div>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-serif text-luxury-ivory mb-2">{t('shop.title')}</h1>
          <p className="text-luxury-ivory/60 mb-6">{t('shop.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory placeholder:text-luxury-ivory/40"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {products.length === 0 ? (
          <motion.p
            className="text-luxury-ivory/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('shop.noProducts')}
          </motion.p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-luxury-ivory/60 py-12 text-center">No products match your search</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial="hidden"
            animate="visible"
            variants={staggerFast}
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <Link href={`/shop/${product.id}`} className="group block">
                  <motion.div
                    className="relative aspect-square overflow-hidden mb-4 bg-charcoal/50 border border-luxury-gold/10"
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Image
                    src={product.image_url || 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/EACFC3B5-7CE0-4E0F-9DCC-80661437A4DF.png?v=1770527071'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-luxury-gold text-sm tracking-wide">{t('shop.viewProduct')}</span>
                  </div>
                </motion.div>
                    <p className="text-luxury-gold/80 text-xs uppercase tracking-wider mb-1">{product.category || t('common.product')}</p>
                    <h2 className="font-serif text-luxury-ivory group-hover:text-luxury-gold transition-colors duration-300">
                      {product.name}
                    </h2>
                    <p className="text-luxury-gold text-sm mt-1">
                      {product.price != null ? `$${product.price}` : '—'}
                    </p>
                  </Link>
                </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
