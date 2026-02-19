'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { diagnosticQuestions, mockBeautyProfile } from '@/lib/mockData';
import { getProducts } from '@/lib/api';
import { trackProductPlacement } from '@/lib/trackProductPlacement';

const RECOMMENDATION_SEARCH = {
  1: 'Booster Puissance',
  5: 'Crème Visage Blanche',
  7: 'Gamme Blanche Injection',
};

export default function DiagnosticPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {});
  }, []);

  const currentQuestion = diagnosticQuestions[step];
  const progress = ((step + 1) / diagnosticQuestions.length) * 100;

  const recommendedProducts = completed
    ? mockBeautyProfile.recommendations
        .map((r) => {
          const search = RECOMMENDATION_SEARCH[r.productId] || '';
          return products.find((p) => p.name?.includes(search));
        })
        .filter(Boolean)
    : [];

  useEffect(() => {
    if (!completed || recommendedProducts.length === 0) return;
    recommendedProducts.forEach((product, idx) => {
      const rec = mockBeautyProfile.recommendations[idx];
      trackProductPlacement({
        productId: product.id,
        placementType: 'prescription',
        reason: rec?.reason || 'Beauty profile match',
        confidence: 0.85,
      });
    });
  }, [completed, recommendedProducts]);

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);
    if (step < diagnosticQuestions.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  if (completed) {
    return (
      <div className="min-h-[calc(100vh-200px)] px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif text-luxury-ivory mb-2">Your Beauty Profile</h1>
          <p className="text-luxury-ivory/60 mb-12">Personalized insights based on your responses</p>

          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Skin Profile</h2>
              <div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg">
                <p className="text-luxury-ivory/90 mb-2">
                  <span className="text-luxury-gold">Skin Type:</span> {mockBeautyProfile.skinType}
                </p>
                <p className="text-luxury-ivory/90">
                  <span className="text-luxury-gold">Main Concerns:</span> {mockBeautyProfile.mainConcerns.join(', ')}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Recommended Products</h2>
              <div className="space-y-4">
                {recommendedProducts.length === 0 ? (
                  <p className="text-luxury-ivory/60">Loading recommendations…</p>
                ) : (
                  recommendedProducts.map((product, idx) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.id}`}
                      className="flex gap-4 p-4 bg-charcoal/50 border border-luxury-gold/20 hover:border-luxury-gold/40 transition-colors rounded-lg"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden">
                        <Image
                          src={product.image_url || 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/6B721838-0682-4945-B5A9-17F6541D00AC.png'}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-luxury-ivory">{product.name}</h3>
                        <p className="text-luxury-gold text-sm">
                          {product.price != null ? `$${product.price}` : '—'}
                        </p>
                        <p className="text-luxury-ivory/60 text-sm mt-1">
                          {mockBeautyProfile.recommendations[idx]?.reason}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Suggested Routine</h2>
              <div className="space-y-3">
                {mockBeautyProfile.routine.map((stepItem, i) => (
                  <p key={i} className="text-luxury-ivory/80 pl-4 border-l-2 border-luxury-gold/30">
                    {stepItem}
                  </p>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Beauty Tips</h2>
              <ul className="space-y-2">
                {mockBeautyProfile.tips.map((tip, i) => (
                  <li key={i} className="text-luxury-ivory/80 flex items-start gap-2">
                    <span className="text-luxury-gold">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="px-8 py-3 bg-luxury-gold text-luxury-black font-medium hover:bg-luxury-gold/90 transition-colors text-center"
            >
              Shop Recommendations
            </Link>
            <button
              onClick={() => {
                setStep(0);
                setAnswers({});
                setCompleted(false);
              }}
              className="px-8 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 transition-colors"
            >
              Retake Diagnostic
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-serif text-luxury-ivory mb-2">Beauty Diagnostic</h1>
          <p className="text-luxury-ivory/60 mb-6">
            Answer a few questions to receive your personalized beauty profile
          </p>
          <div className="h-1 bg-charcoal rounded-full overflow-hidden">
            <div
              className="h-full bg-luxury-gold transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-luxury-ivory/50 text-sm mt-2">
            Question {step + 1} of {diagnosticQuestions.length}
          </p>
        </div>

        <div className="bg-charcoal/50 border border-luxury-gold/20 p-8 rounded-lg">
          <h2 className="text-xl font-serif text-luxury-ivory mb-6">{currentQuestion.question}</h2>
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="w-full text-left px-6 py-4 border border-luxury-gold/30 text-luxury-ivory hover:border-luxury-gold hover:bg-luxury-gold/5 transition-colors rounded-lg"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {step > 0 && (
          <button
            onClick={handleBack}
            className="mt-8 flex items-center gap-2 text-luxury-ivory/60 hover:text-luxury-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
