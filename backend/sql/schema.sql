-- =====================================================
-- IVALUX IMPERIAL - Supabase Schema
-- Run in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES (linked to auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'employee', 'admin')),
  full_name TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PRODUCTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  countries_available TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCT_PLACEMENTS (AI tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.product_placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  placement_type TEXT NOT NULL CHECK (placement_type IN ('chat', 'prescription', 'product_page')),
  reason TEXT,
  confidence DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_placements_user ON public.product_placements(user_id);
CREATE INDEX IF NOT EXISTS idx_product_placements_product ON public.product_placements(product_id);
CREATE INDEX IF NOT EXISTS idx_product_placements_created ON public.product_placements(created_at);

-- =====================================================
-- DISTRIBUTORS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.distributors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  photo_url TEXT,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMPLOYEE_PRODUCT_HANDLING
-- =====================================================
CREATE TABLE IF NOT EXISTS public.employee_product_handling (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, product_id, country)
);

CREATE INDEX IF NOT EXISTS idx_emp_handling_employee ON public.employee_product_handling(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_handling_product ON public.employee_product_handling(product_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- RLS enabled on all tables. Policy definitions are in rls-policies.sql
-- Run schema.sql first, then rls-policies.sql

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_product_handling ENABLE ROW LEVEL SECURITY;
