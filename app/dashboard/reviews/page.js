'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getReviews, deleteReview } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function ClientReviewsPage() {
  return (
    <ProtectedClientRoute>
      <ClientReviewsContent />
    </ProtectedClientRoute>
  );
}

function ClientReviewsContent() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) fetchReviews();
  }, [currentUser?.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getReviews({ client_id: currentUser?.id });
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      fetchReviews();
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-8">My Reviews</h1>

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60 mb-4">You haven't written any reviews yet</p>
              <Link href="/shop">
                <motion.button
                  className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Browse Products & Review
                </motion.button>
              </Link>
            </div>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
                variants={fadeInUp}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link href={`/shop/${review.product_id || review.products?.id}`}>
                      <h3 className="text-lg font-serif text-luxury-ivory hover:text-luxury-gold transition-colors mb-2">
                        {review.products?.name || 'Product'}
                      </h3>
                    </Link>
                    <div className="flex gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= (review.rating || 0) ? 'text-luxury-gold' : 'text-luxury-ivory/30'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-luxury-ivory/60 text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <h4 className="font-medium text-luxury-ivory mb-2">{review.title}</h4>
                <p className="text-luxury-ivory/80">{review.content}</p>
                <div className="mt-4">
                  <Link href={`/shop/${review.product_id || review.products?.id}`} className="text-luxury-gold hover:underline text-sm">
                    View Product →
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
