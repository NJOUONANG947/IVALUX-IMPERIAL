'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SkinScanner from '@/components/beauty/SkinScanner';
import { useLanguage } from '@/lib/i18n';
import { getProducts } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default function BeautyScannerPage() {
  const { t } = useLanguage();
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);

  const handleAnalysisComplete = async (analysis) => {
    setHasScanned(true);
    // Fetch recommended products based on analysis
    try {
      const products = await getProducts();
      // Filter products based on skin type and concerns
      const filtered = products
        .filter(p => {
          const name = p.name?.toLowerCase() || '';
          if (analysis.skinType === 'Dry' && name.includes('hydrat')) return true;
          if (analysis.concerns.some(c => c.name === 'Dark Spots') && name.includes('blanch')) return true;
          return false;
        })
        .slice(0, 4);
      setRecommendedProducts(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-200px)] px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-luxury-ivory mb-4">
            AI Skin Scanner
          </h1>
          <p className="text-luxury-ivory/70 max-w-2xl mx-auto">
            Advanced AI-powered skin analysis. Upload a photo or use your camera for instant personalized recommendations.
          </p>
        </div>

        <SkinScanner onAnalysisComplete={handleAnalysisComplete} />

        {hasScanned && recommendedProducts.length > 0 && (
          <motion.section
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-serif text-luxury-gold mb-6">Recommended Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} className="group block">
                  <div className="relative aspect-square overflow-hidden mb-3 bg-charcoal/50 border border-luxury-gold/10 rounded">
                    <Image
                      src={product.image_url || 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/EACFC3B5-7CE0-4E0F-9DCC-80661437A4DF.png?v=1770527071'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <h3 className="font-serif text-luxury-ivory group-hover:text-luxury-gold transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-luxury-gold text-sm mt-1">
                    {product.price != null ? `$${product.price}` : '—'}
                  </p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </motion.div>
  );
}
