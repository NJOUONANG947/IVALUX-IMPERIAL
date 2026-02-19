'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function SkinScanner({ onAnalysisComplete }) {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraMode, setCameraMode] = useState(false);

  const analyzeSkin = async (imageFile) => {
    setIsScanning(true);
    // Simulate AI analysis (in production, send to backend AI service)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis results
    const mockAnalysis = {
      skinType: ['Dry', 'Normal', 'Oily', 'Combination'][Math.floor(Math.random() * 4)],
      concerns: [
        { name: 'Fine Lines', severity: Math.floor(Math.random() * 5) + 1, confidence: 0.85 },
        { name: 'Dark Spots', severity: Math.floor(Math.random() * 5) + 1, confidence: 0.78 },
        { name: 'Pores', severity: Math.floor(Math.random() * 5) + 1, confidence: 0.72 },
        { name: 'Hydration', severity: Math.floor(Math.random() * 5) + 1, confidence: 0.88 },
      ],
      recommendations: [
        'Use hydrating serum daily',
        'Apply SPF 50+ every morning',
        'Consider retinol treatment',
      ],
      score: Math.floor(Math.random() * 30) + 70, // 70-100
    };

    setAnalysis(mockAnalysis);
    setIsScanning(false);
    if (onAnalysisComplete) {
      onAnalysisComplete(mockAnalysis);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        analyzeSkin(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'skin-photo.jpg', { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target.result);
          analyzeSkin(file);
        };
        reader.readAsDataURL(file);
        setCameraMode(false);
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraMode(true);
      }
    } catch (err) {
      alert('Camera access denied. Please upload a photo instead.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!analysis ? (
        <motion.div
          className="bg-charcoal/50 border border-luxury-gold/20 p-8 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-serif text-luxury-gold mb-4">AI Skin Scanner</h2>
          <p className="text-luxury-ivory/70 mb-6">
            Upload a photo or use your camera for instant skin analysis powered by AI
          </p>

          {!cameraMode ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-luxury-gold/30 rounded-lg p-12 text-center">
                {image ? (
                  <img src={image} alt="Skin scan" className="max-w-full max-h-64 mx-auto rounded" />
                ) : (
                  <div>
                    <svg className="w-16 h-16 mx-auto text-luxury-gold/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-luxury-ivory/60 mb-4">Upload a clear photo of your face</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 bg-luxury-gold text-luxury-black font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isScanning}
                >
                  {isScanning ? 'Analyzing...' : 'Upload Photo'}
                </motion.button>
                <motion.button
                  onClick={startCamera}
                  className="flex-1 py-3 border border-luxury-gold text-luxury-gold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isScanning}
                >
                  Use Camera
                </motion.button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="flex gap-4">
                <motion.button
                  onClick={capturePhoto}
                  className="flex-1 py-3 bg-luxury-gold text-luxury-black font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Capture & Analyze
                </motion.button>
                <button
                  onClick={() => {
                    setCameraMode(false);
                    if (videoRef.current?.srcObject) {
                      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                    }
                  }}
                  className="px-4 py-3 border border-luxury-gold/50 text-luxury-ivory/80"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isScanning && (
            <motion.div
              className="mt-6 p-4 bg-luxury-gold/10 border border-luxury-gold/30 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
                <p className="text-luxury-gold">AI is analyzing your skin...</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="bg-charcoal/50 border border-luxury-gold/20 p-8 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-luxury-gold">Analysis Results</h2>
            <button
              onClick={() => {
                setAnalysis(null);
                setImage(null);
              }}
              className="text-luxury-ivory/60 hover:text-luxury-gold"
            >
              New Scan
            </button>
          </div>

          {image && (
            <div className="mb-6">
              <img src={image} alt="Analyzed skin" className="w-full max-w-md mx-auto rounded-lg" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-luxury-black/50 p-4 rounded">
              <p className="text-luxury-ivory/60 text-sm mb-1">Skin Type</p>
              <p className="text-xl font-serif text-luxury-gold">{analysis.skinType}</p>
            </div>
            <div className="bg-luxury-black/50 p-4 rounded">
              <p className="text-luxury-ivory/60 text-sm mb-1">Skin Score</p>
              <p className="text-xl font-serif text-luxury-gold">{analysis.score}/100</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-serif text-luxury-gold mb-3">Skin Concerns</h3>
            <div className="space-y-2">
              {analysis.concerns.map((concern, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-luxury-ivory">{concern.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-luxury-black rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-luxury-gold to-amber-600"
                        style={{ width: `${(concern.severity / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-luxury-gold text-sm w-8">{concern.severity}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-serif text-luxury-gold mb-3">AI Recommendations</h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-luxury-ivory/90">
                  <span className="text-luxury-gold mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
