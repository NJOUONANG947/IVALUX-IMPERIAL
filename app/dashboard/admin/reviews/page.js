'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getAdminReviews, deleteAdminReview } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AdminReviewsPage() {
  return (
    <ProtectedAdminRoute>
      <AdminReviewsContent />
    </ProtectedAdminRoute>
  );
}

function AdminReviewsContent() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = ratingFilter !== 'all' ? { rating: parseInt(ratingFilter, 10) } : { limit: 100 };
      const data = await getAdminReviews(params);
      setReviews(data);
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    setDeleting(id);
    try {
      await deleteAdminReview(id);
      fetchReviews();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Reviews</h1>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60">No reviews found</p>
            </div>
          ) : (
            reviews.map((review) => (
              <motion.div key={review.id} className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link href={`/shop/${review.product_id}`} className="text-luxury-gold hover:underline font-medium">
                        {review.products?.name || 'Product'}
                      </Link>
                      <span className="text-luxury-gold">{'⭐'.repeat(review.rating || 0)}</span>
                    </div>
                    <p className="text-luxury-ivory/80 font-medium mb-1">{review.title || '—'}</p>
                    <p className="text-luxury-ivory/70 mb-2">{review.content || '—'}</p>
                    <p className="text-luxury-ivory/50 text-sm">
                      By {review.profiles_client_id?.full_name || review.profiles_client_id?.email || 'Anonymous'} · {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    disabled={deleting === review.id}
                    className="px-3 py-1.5 border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {deleting === review.id ? '…' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
