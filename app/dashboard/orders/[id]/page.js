'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getOrder } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';
import Image from 'next/image';

export default function OrderDetailPage() {
  return (
    <ProtectedClientRoute>
      <OrderDetailContent />
    </ProtectedClientRoute>
  );
}

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getOrder(params.id)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-luxury-ivory/60 mb-4">Order not found</p>
          <button onClick={() => router.back()} className="px-6 py-3 border border-luxury-gold text-luxury-gold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif text-luxury-ivory mb-2">Order Details</h1>
            <p className="text-luxury-ivory/60">Order #{order.id.slice(0, 8)}</p>
          </div>
          <span className={`px-4 py-2 rounded capitalize ${statusColors[order.status] || 'bg-charcoal text-luxury-ivory'}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.section
              className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
              variants={fadeInUp}
            >
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-luxury-gold/10 last:border-0">
                    <div className="relative w-20 h-20 bg-charcoal rounded overflow-hidden">
                      {item.products?.image_url && (
                        <Image
                          src={item.products.image_url}
                          alt={item.products.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-luxury-ivory mb-1">{item.products?.name || 'Product'}</h3>
                      <p className="text-luxury-ivory/60 text-sm">Quantity: {item.quantity}</p>
                      <p className="text-luxury-gold mt-1">${item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-luxury-ivory font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {order.shipping_address && (
              <motion.section
                className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
                variants={fadeInUp}
              >
                <h2 className="text-xl font-serif text-luxury-gold mb-4">Shipping Address</h2>
                <div className="text-luxury-ivory/80">
                  {typeof order.shipping_address === 'string' ? (
                    <p>{order.shipping_address}</p>
                  ) : (
                    <div>
                      {order.shipping_address.street && <p>{order.shipping_address.street}</p>}
                      {order.shipping_address.city && (
                        <p>
                          {order.shipping_address.city}
                          {order.shipping_address.postal_code && `, ${order.shipping_address.postal_code}`}
                        </p>
                      )}
                      {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </div>

          <div className="space-y-6">
            <motion.section
              className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
              variants={fadeInUp}
            >
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-luxury-ivory/80">
                  <span>Subtotal</span>
                  <span>${order.subtotal_amount?.toFixed(2) || '0.00'}</span>
                </div>
                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-luxury-ivory/80">
                    <span>Tax</span>
                    <span>${order.tax_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                {order.shipping_amount > 0 && (
                  <div className="flex justify-between text-luxury-ivory/80">
                    <span>Shipping</span>
                    <span>${order.shipping_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-luxury-gold/20 flex justify-between text-luxury-gold font-medium">
                  <span>Total</span>
                  <span>${order.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </motion.section>

            <motion.section
              className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
              variants={fadeInUp}
            >
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Order Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-luxury-ivory/60">Order Date:</span>
                  <p className="text-luxury-ivory">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {order.payment_method && (
                  <div>
                    <span className="text-luxury-ivory/60">Payment Method:</span>
                    <p className="text-luxury-ivory capitalize">{order.payment_method}</p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <span className="text-luxury-ivory/60">Notes:</span>
                    <p className="text-luxury-ivory">{order.notes}</p>
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
