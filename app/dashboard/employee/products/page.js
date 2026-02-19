'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { getProducts, getEmployeeProductHandlings, handleProduct, unassignProduct } from '@/lib/api';
import { fadeInUp } from '@/lib/motion';

export default function EmployeeProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [handlings, setHandlings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [country, setCountry] = useState('CA');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, hands] = await Promise.all([getProducts(), getEmployeeProductHandlings()]);
      setProducts(prods);
      setHandlings(hands);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (productId) => {
    setAdding(true);
    try {
      await handleProduct({ product_id: productId, country });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to add product');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (e, handlingId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Remove this product from your assignments?')) return;
    setRemovingId(handlingId);
    try {
      await unassignProduct(handlingId);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to remove');
    } finally {
      setRemovingId(null);
    }
  };

  const handlingIds = new Set(handlings.map((h) => h.product_id));

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">My Products</h1>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory">
            <option value="CA">Canada</option>
            <option value="US">United States</option>
            <option value="FR">France</option>
            <option value="BE">Belgium</option>
          </select>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-serif text-luxury-gold mb-4">Assigned Products ({handlings.length})</h2>
          {handlings.length === 0 ? (
            <p className="text-luxury-ivory/60">No products assigned yet. Add products below.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {handlings.map((h) => (
                <div key={h.id} className="group relative">
                  <Link href={`/shop/${h.products?.id}`} className="block">
                    <motion.div className="bg-charcoal/50 border border-luxury-gold/20 rounded-lg overflow-hidden" variants={fadeInUp} whileHover={{ y: -4 }}>
                      <div className="relative aspect-square">
                        <Image
                          src={h.products?.image_url || 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/placeholder.png'}
                          alt={h.products?.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="150px"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-luxury-ivory text-sm truncate group-hover:text-luxury-gold">{h.products?.name}</p>
                        <p className="text-luxury-gold/70 text-xs">{h.country}</p>
                      </div>
                    </motion.div>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, h.id)}
                    disabled={removingId === h.id}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white text-sm flex items-center justify-center hover:bg-red-500 disabled:opacity-60"
                    title="Remove assignment"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-serif text-luxury-gold mb-4">Add Product to My Assignments</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products
              .filter((p) => !handlingIds.has(p.id))
              .slice(0, 20)
              .map((product) => (
                <motion.div key={product.id} className="bg-charcoal/50 border border-luxury-gold/20 rounded-lg overflow-hidden" variants={fadeInUp}>
                  <div className="relative aspect-square">
                    <Image
                      src={product.image_url || 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-luxury-ivory text-sm truncate mb-2">{product.name}</p>
                    <motion.button
                      onClick={() => handleAdd(product.id)}
                      disabled={adding}
                      className="w-full py-2 border border-luxury-gold/50 text-luxury-gold text-sm disabled:opacity-60"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add for {country}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
