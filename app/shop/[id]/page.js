'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getProduct, getProducts, getReviews } from '@/lib/api';
import { fadeInUp, staggerFast } from '@/lib/motion';
import { trackProductPlacement } from '@/lib/trackProductPlacement';
import { mockBeautyProfile } from '@/lib/mockData';
import { useLanguage } from '@/lib/i18n';

export default function ProductDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!params?.id) return;
    getProduct(params.id)
      .then((p) => {
        setProduct(p);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params?.id]);

  useEffect(() => {
    if (!product) return;
    getProducts()
      .then((products) => {
        const recNames = mockBeautyProfile.recommendations.map((r) => {
          const names = {
            1: 'Booster Puissance Blancheur',
            5: 'Crème Visage Blanche Injection',
            7: 'Gamme Blanche Injection',
          };
          return names[r.productId] || '';
        }).filter(Boolean);
        const recs = products.filter((p) => recNames.some((n) => p.name?.includes(n)));
        setRecommendations(recs.slice(0, 3));
      })
      .catch(() => setRecommendations([]));
    
    // Load reviews
    getReviews({ product_id: product.id, limit: 10 })
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [product]);

  useEffect(() => {
    if (!product || recommendations.length === 0) return;
    recommendations.forEach((rec) => {
      const reason = mockBeautyProfile.recommendations.find(
        (r) => {
          const names = { 1: 'Booster', 5: 'Crème Visage', 7: 'Gamme Blanche' };
          return rec.name?.includes(names[r.productId]);
        }
      )?.reason;
      trackProductPlacement({
        productId: rec.id,
        placementType: 'product_page',
        reason: reason || 'Recommended for you',
        confidence: 0.8,
      });
    });
  }, [product?.id, recommendations]);

  if (loading) {
    return (
      <motion.div
        className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-luxury-gold/50 border-t-luxury-gold rounded-full animate-spin" />
          <p className="text-luxury-ivory/60">{t('common.loading')}</p>
        </div>
      </motion.div>
    );
  }
  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-serif text-luxury-ivory mb-4">{t('common.productNotFound')}</h1>
        <Link href="/shop" className="text-luxury-gold hover:underline">{t('shop.backToShop')}</Link>
      </div>
    );
  }

  const imageUrl = product.image_url || 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/EACFC3B5-7CE0-4E0F-9DCC-80661437A4DF.png?v=1770527071';
  const IVALUX_SITE = 'https://ivaluximperial.com';

  return (
    <motion.div
      className="min-h-[calc(100vh-200px)] px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/shop" className="inline-flex items-center text-luxury-ivory/60 hover:text-luxury-gold text-sm mb-8 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('shop.backToShop')}
        </Link>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16"
          initial="hidden"
          animate="visible"
          variants={staggerFast}
        >
          <motion.div
            className="relative aspect-square max-h-[600px] overflow-hidden bg-charcoal/50 border border-luxury-gold/10"
            variants={fadeInUp}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <p className="text-luxury-gold/80 text-xs uppercase tracking-wider mb-2">{product.category || t('common.product')}</p>
            <h1 className="text-3xl md:text-4xl font-serif text-luxury-ivory mb-4">{product.name}</h1>
            <p className="text-luxury-gold text-2xl mb-6">
              {product.price != null ? `$${product.price}` : '—'}
            </p>
            <p className="text-luxury-ivory/80 leading-relaxed mb-8">{product.description || ''}</p>

            <motion.div
              className="mb-8 p-4 bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg"
              variants={fadeInUp}
            >
              <p className="text-luxury-ivory/90 text-sm mb-3">
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
                {t('shop.buyOnSite')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>
            </motion.div>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeInUp}
            >
              <motion.button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('openLuxy'))}
                className="px-8 py-3 border border-luxury-gold text-luxury-gold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(201, 169, 97, 0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="w-6 h-6 rounded-full bg-luxury-gold/20 flex items-center justify-center text-xs font-bold text-luxury-gold">L</span>
                {t('shop.askLuxy')}
              </motion.button>
              <Link href={`/shop/${params.id}/review`}>
                <motion.button
                  type="button"
                  className="px-8 py-3 border border-luxury-gold/50 text-luxury-ivory/80 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, borderColor: '#C9A961', color: '#C9A961' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Write Review
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Reviews Section */}
        <motion.section
          className="mt-24 border-t border-luxury-gold/20 pt-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-luxury-ivory">Reviews</h2>
            <Link href={`/shop/${params.id}/review`}>
              <motion.button
                className="px-4 py-2 border border-luxury-gold/50 text-luxury-gold text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Write Review
              </motion.button>
            </Link>
          </div>
          
          {reviewsLoading ? (
            <div className="text-center py-12 text-luxury-ivory/60">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-luxury-ivory/60">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={star <= review.rating ? 'text-luxury-gold' : 'text-luxury-ivory/30'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-luxury-ivory/60 text-sm">
                          {review.profiles?.full_name || review.profiles?.email || 'Anonymous'}
                        </span>
                        {review.is_verified_purchase && (
                          <span className="px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold text-xs rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-serif text-luxury-ivory mb-2">{review.title}</h3>
                    </div>
                    <span className="text-luxury-ivory/40 text-xs">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-luxury-ivory/80 mb-4">{review.content}</p>
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {review.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Review photo ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border border-luxury-gold/20"
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {recommendations.length > 0 && (
          <motion.section
            className="mt-24 border-t border-luxury-gold/20 pt-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-serif text-luxury-ivory mb-8">{t('shop.youMayAlsoLike')}</h2>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerFast}
            >
              {recommendations.map((rec) => (
                <motion.div key={rec.id} variants={fadeInUp}>
                  <Link href={`/shop/${rec.id}`} className="group block">
                    <motion.div
                      className="relative aspect-square overflow-hidden mb-4 bg-charcoal/50 border border-luxury-gold/10"
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Image
                        src={rec.image_url || imageUrl}
                        alt={rec.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </motion.div>
                    <h3 className="font-serif text-luxury-ivory group-hover:text-luxury-gold transition-colors duration-300">{rec.name}</h3>
                    <p className="text-luxury-gold text-sm mt-1">
                      {rec.price != null ? `$${rec.price}` : '—'}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </div>
    </motion.div>
  );
}
