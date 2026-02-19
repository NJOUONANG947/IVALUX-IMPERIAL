'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { products } from '@/lib/mockData';
import { fadeInUp, stagger, staggerFast } from '@/lib/motion';
import { useLanguage } from '@/lib/i18n';

export default function HomePage() {
  const featuredProducts = products.filter((p) => p.featured);
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black via-luxury-black/95 to-luxury-black" />
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-luxury-gold/10 rounded-full blur-3xl animate-pulse-slow" />
        </motion.div>
        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.p
            variants={fadeInUp}
            className="text-luxury-gold text-sm tracking-[0.4em] uppercase mb-4 font-sans"
          >
            {t('home.tagline')}
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-serif text-luxury-ivory mb-6 tracking-wide"
          >
            IVALUX
            <span className="block text-gradient-gold">IMPERIAL</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-luxury-ivory/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t('home.subtitle')}
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/shop">
              <motion.span
                className="inline-block px-10 py-4 bg-luxury-gold text-luxury-black font-medium tracking-wide"
                whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(201, 169, 97, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {t('home.exploreCollection')}
              </motion.span>
            </Link>
            <Link href="/diagnostic">
              <motion.span
                className="inline-block px-10 py-4 border border-luxury-gold text-luxury-gold"
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(201, 169, 97, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {t('home.startConsultation')}
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 bg-gradient-to-b from-luxury-black to-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-luxury-ivory mb-4">
              {t('home.featuredCollection')}
            </h2>
            <p className="text-luxury-ivory/60 max-w-xl mx-auto">
              {t('home.featuredDesc')}
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerFast}
          >
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <Link href={`/shop/${product.id}`} className="group block">
                  <motion.div
                    className="relative aspect-square overflow-hidden mb-4 bg-charcoal/50 border border-luxury-gold/10"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                  <h3 className="font-serif text-luxury-ivory group-hover:text-luxury-gold transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-luxury-gold text-sm mt-1">${product.price}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center text-luxury-gold hover:text-luxury-ivory transition-colors text-sm tracking-wide"
            >
              {t('home.viewAllProducts')}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-24 px-6 border-t border-luxury-gold/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-luxury-ivory mb-6">
            {t('home.aiCta')}
          </h2>
          <p className="text-luxury-ivory/70 mb-10 leading-relaxed">
            {t('home.aiCtaDesc')}
          </p>
          <motion.div
            className="flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-luxury-gold to-amber-700 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 0 0 rgba(201,169,97,0.3)', '0 0 0 12px rgba(201,169,97,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-luxury-black font-serif font-bold text-lg">L</span>
            </motion.div>
            <span className="text-luxury-gold font-medium">{t('home.luxyReady')}</span>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
