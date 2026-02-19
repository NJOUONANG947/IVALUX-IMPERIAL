'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getMarketplaceProducts, getMarketplaceSellers } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function MarketplacePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ seller_type: '', is_verified: true });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, s] = await Promise.all([
        getMarketplaceProducts({ is_active: true, limit: 50 }),
        getMarketplaceSellers({ is_verified: filter.is_verified, seller_type: filter.seller_type || undefined }),
      ]);
      setProducts(p || []);
      setSellers(s || []);
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
        <h1 className="text-4xl font-serif text-luxury-ivory mb-8">Marketplace B2B2C</h1>

        <div className="flex gap-4 mb-8">
          <select
            value={filter.seller_type}
            onChange={(e) => setFilter({ ...filter, seller_type: e.target.value })}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="">All Sellers</option>
            <option value="distributor">Distributors</option>
            <option value="retailer">Retailers</option>
            <option value="influencer">Influencers</option>
            <option value="beauty_salon">Beauty Salons</option>
            <option value="spa">Spas</option>
          </select>
          <label className="flex items-center gap-2 text-luxury-ivory/80">
            <input
              type="checkbox"
              checked={filter.is_verified}
              onChange={(e) => setFilter({ ...filter, is_verified: e.target.checked })}
              className="w-4 h-4"
            />
            Verified Only
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.section className="lg:col-span-2 bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.length === 0 ? (
                <p className="text-luxury-ivory/60 col-span-full">No products available</p>
              ) : (
                products.map((mp) => (
                  <div key={mp.id} className="p-4 bg-luxury-black/50 rounded border border-luxury-gold/10">
                    <Link href={`/shop/${mp.product_id}`} className="text-luxury-gold hover:underline font-medium">
                      {mp.products?.name || 'Product'}
                    </Link>
                    <p className="text-luxury-ivory/80 mt-1">
                      Seller: {mp.marketplace_sellers?.seller_name || '—'}
                    </p>
                    <p className="text-luxury-gold font-medium mt-2">${Number(mp.price).toLocaleString()}</p>
                    {mp.stock_quantity !== undefined && (
                      <p className="text-luxury-ivory/50 text-xs mt-1">Stock: {mp.stock_quantity}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.section>

          <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Verified Sellers</h2>
            <div className="space-y-3">
              {sellers.length === 0 ? (
                <p className="text-luxury-ivory/60">No sellers available</p>
              ) : (
                sellers.map((seller) => (
                  <div key={seller.id} className="p-3 bg-luxury-black/50 rounded border border-luxury-gold/10">
                    <p className="text-luxury-ivory font-medium">{seller.seller_name}</p>
                    <p className="text-luxury-ivory/60 text-sm capitalize">{seller.seller_type.replace('_', ' ')}</p>
                    {seller.country && <p className="text-luxury-ivory/50 text-xs">{seller.country}</p>}
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
