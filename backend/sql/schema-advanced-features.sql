-- =====================================================
-- IVALUX IMPERIAL - Advanced Features Schema
-- Analyse comportementale, Métavers, IA avancée
-- This version creates missing tables automatically
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure required tables exist (create if missing)
DO $$
BEGIN
  -- Ensure products table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    CREATE TABLE IF NOT EXISTS public.products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      countries_available TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  -- Ensure reviews table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    CREATE TABLE IF NOT EXISTS public.reviews (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title TEXT,
      content TEXT,
      photos JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  -- Ensure consultations table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'consultations') THEN
    CREATE TABLE IF NOT EXISTS public.consultations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      client_name TEXT NOT NULL,
      consultation_type TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      amount DECIMAL(10,2),
      satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  -- Ensure orders table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    CREATE TABLE IF NOT EXISTS public.orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      total DECIMAL(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      country TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- =====================================================
-- USER_BEHAVIOR_ANALYTICS
-- Analyse comportementale avancée
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'add_to_cart', 'purchase', 'consultation', 'review', 'search', 'filter', 'click', 'scroll', 'time_spent')),
  event_data JSONB DEFAULT '{}',
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  category TEXT,
  motivation TEXT, -- motivation d'achat analysée
  emotional_state TEXT, -- état émotionnel détecté
  segment TEXT, -- segment comportemental
  predicted_need TEXT, -- besoin futur prédit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavior_user ON public.user_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_event ON public.user_behavior_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_behavior_created ON public.user_behavior_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_behavior_product ON public.user_behavior_analytics(product_id);

-- =====================================================
-- USER_SEGMENTS
-- Segmentation comportementale
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  segment_type TEXT NOT NULL CHECK (segment_type IN ('price_sensitive', 'quality_focused', 'trend_follower', 'loyal_customer', 'explorer', 'impulse_buyer', 'researcher', 'social_shopper')),
  confidence DECIMAL(3,2) DEFAULT 0.5,
  attributes JSONB DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_segments_user ON public.user_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_segments_type ON public.user_segments(segment_type);

-- =====================================================
-- SENTIMENT_ANALYSIS
-- Analyse de sentiment des avis
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  sentiment_score DECIMAL(3,2), -- -1 to 1
  emotions JSONB DEFAULT '{}', -- {joy: 0.8, trust: 0.7, ...}
  topics JSONB DEFAULT '[]', -- topics détectés
  keywords JSONB DEFAULT '[]',
  alert_level TEXT CHECK (alert_level IN ('none', 'low', 'medium', 'high', 'critical')),
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sentiment_review ON public.sentiment_analysis(review_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_score ON public.sentiment_analysis(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_sentiment_alert ON public.sentiment_analysis(alert_level);

-- =====================================================
-- SATISFACTION_ALERTS
-- Alertes de satisfaction en temps réel
-- =====================================================
CREATE TABLE IF NOT EXISTS public.satisfaction_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_rating', 'negative_sentiment', 'complaint', 'churn_risk', 'satisfaction_drop')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.satisfaction_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON public.satisfaction_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.satisfaction_alerts(severity);

-- =====================================================
-- METAVERSE_STORES
-- Boutiques dans le métavers
-- =====================================================
CREATE TABLE IF NOT EXISTS public.metaverse_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('decentraland', 'roblox', 'sandbox', 'vrchat', 'custom')),
  store_name TEXT NOT NULL,
  world_coordinates TEXT, -- coordonnées dans le monde virtuel
  store_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER_AVATARS
-- Avatars personnalisables
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_name TEXT,
  avatar_data JSONB NOT NULL DEFAULT '{}', -- données de l'avatar (visage, corps, etc.)
  skin_tone TEXT,
  hair_style TEXT,
  hair_color TEXT,
  eye_color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avatars_user ON public.user_avatars(user_id);

-- =====================================================
-- DIGITAL_LOOKS
-- Collection de looks digitaux
-- =====================================================
CREATE TABLE IF NOT EXISTS public.digital_looks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_id UUID REFERENCES public.user_avatars(id) ON DELETE CASCADE,
  look_name TEXT NOT NULL,
  products_used JSONB DEFAULT '[]', -- produits IVALUX utilisés
  look_data JSONB NOT NULL DEFAULT '{}', -- configuration complète du look
  preview_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_nft BOOLEAN DEFAULT FALSE,
  nft_token_id TEXT,
  nft_contract_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_looks_user ON public.digital_looks(user_id);
CREATE INDEX IF NOT EXISTS idx_looks_avatar ON public.digital_looks(avatar_id);
CREATE INDEX IF NOT EXISTS idx_looks_nft ON public.digital_looks(is_nft);

-- =====================================================
-- VIRTUAL_EVENTS
-- Événements virtuels
-- =====================================================
CREATE TABLE IF NOT EXISTS public.virtual_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('product_launch', 'masterclass', 'consultation', 'showcase', 'social')),
  platform TEXT NOT NULL CHECK (platform IN ('decentraland', 'roblox', 'vrchat', 'custom')),
  event_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  description TEXT,
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENT_ATTENDANCES
-- Participation aux événements
-- =====================================================
CREATE TABLE IF NOT EXISTS public.event_attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.virtual_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_id UUID REFERENCES public.user_avatars(id) ON DELETE SET NULL,
  attended BOOLEAN DEFAULT FALSE,
  attendance_duration_minutes INTEGER,
  feedback JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_attendances_event ON public.event_attendances(event_id);
CREATE INDEX IF NOT EXISTS idx_attendances_user ON public.event_attendances(user_id);

-- =====================================================
-- AI_PREDICTIONS
-- Prédictions IA avancées
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('purchase_intent', 'churn_risk', 'product_recommendation', 'price_sensitivity', 'lifetime_value', 'next_purchase', 'satisfaction_trend')),
  predicted_value JSONB NOT NULL DEFAULT '{}',
  confidence DECIMAL(3,2),
  model_version TEXT,
  input_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON public.ai_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_type ON public.ai_predictions(prediction_type);

-- =====================================================
-- MARKETPLACE_B2B2C
-- Marketplace B2B2C
-- =====================================================
CREATE TABLE IF NOT EXISTS public.marketplace_sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_name TEXT NOT NULL,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('distributor', 'retailer', 'influencer', 'beauty_salon', 'spa')),
  contact_email TEXT,
  country TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MARKETPLACE_PRODUCTS
-- Produits vendus par les vendeurs B2B2C
-- =====================================================
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.marketplace_sellers(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, seller_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_product ON public.marketplace_products(product_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON public.marketplace_products(seller_id);

-- =====================================================
-- PERSONALIZED_FORMULATIONS
-- Formulations personnalisées
-- =====================================================
CREATE TABLE IF NOT EXISTS public.personalized_formulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  formulation_name TEXT NOT NULL,
  skin_type TEXT,
  skin_concerns JSONB DEFAULT '[]',
  ingredients JSONB NOT NULL DEFAULT '[]',
  formulation_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'manufacturing', 'ready', 'shipped')),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_formulations_user ON public.personalized_formulations(user_id);
CREATE INDEX IF NOT EXISTS idx_formulations_status ON public.personalized_formulations(status);

-- =====================================================
-- IOT_DEVICES
-- Produits IoT connectés
-- =====================================================
CREATE TABLE IF NOT EXISTS public.iot_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL CHECK (device_type IN ('smart_mirror', 'skin_scanner', 'moisture_sensor', 'uv_monitor', 'smart_dispenser')),
  device_name TEXT NOT NULL,
  device_serial TEXT UNIQUE,
  is_connected BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iot_user ON public.iot_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_iot_type ON public.iot_devices(device_type);

-- =====================================================
-- IOT_DEVICE_DATA
-- Données des appareils IoT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.iot_device_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES public.iot_devices(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  data_value JSONB NOT NULL DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iot_data_device ON public.iot_device_data(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_data_recorded ON public.iot_device_data(recorded_at);

-- =====================================================
-- GAMIFICATION_ADVANCED
-- Gamification avancée et quêtes beauté
-- =====================================================
CREATE TABLE IF NOT EXISTS public.beauty_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_name TEXT NOT NULL,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('purchase', 'review', 'consultation', 'social_share', 'look_creation', 'event_attendance', 'streak', 'challenge')),
  description TEXT,
  points_reward INTEGER DEFAULT 0,
  badge_reward TEXT,
  nft_reward BOOLEAN DEFAULT FALSE,
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER_QUEST_PROGRESS
-- Progression des quêtes utilisateur
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES public.beauty_quests(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'claimed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_quest_progress_user ON public.user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_quest ON public.user_quest_progress(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_status ON public.user_quest_progress(status);

-- =====================================================
-- Enable RLS
-- =====================================================
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satisfaction_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metaverse_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_formulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_device_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beauty_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
