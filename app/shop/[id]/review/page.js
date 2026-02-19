'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getProduct, createReview } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export default function ShopReviewPage() {
  return (
    <ProtectedClientRoute>
      <ReviewContent />
    </ProtectedClientRoute>
  );
}

function ReviewContent() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      getProduct(params.id).then(setProduct).catch(console.error);
    }
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await createReview({
        product_id: params.id,
        rating,
        title,
        content,
        photos: [],
      });
      router.push(`/shop/${params.id}`);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-2xl mx-auto">
        <Link href={`/shop/${params.id}`} className="text-luxury-ivory/60 hover:text-luxury-gold text-sm mb-6 inline-block">
          ← Back to product
        </Link>
        <h1 className="text-4xl font-serif text-luxury-ivory mb-2">Write a Review</h1>
        <p className="text-luxury-ivory/60 mb-8">{product.name}</p>

        <motion.form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-luxury-ivory/80 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl"
                >
                  <span className={star <= rating ? 'text-luxury-gold' : 'text-luxury-ivory/30'}>★</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-luxury-ivory/80 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              required
              className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
            />
          </div>
          <div>
            <label className="block text-sm text-luxury-ivory/80 mb-2">Review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={6}
              required
              className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory resize-none"
            />
          </div>
          <div className="flex gap-4">
            <motion.button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </motion.button>
            <button
              type="button"
              onClick={() => router.push(`/shop/${params.id}`)}
              className="px-6 py-3 border border-luxury-gold/50 text-luxury-ivory/80"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
}
