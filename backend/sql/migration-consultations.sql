-- =====================================================
-- IVALUX IMPERIAL - Consultations table for Employee Dashboard
-- Run in Supabase SQL Editor AFTER: schema.sql, rls-policies.sql
-- (is_admin() must exist)
-- =====================================================

-- Consultations (employee-client sessions)
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  consultation_type TEXT NOT NULL CHECK (consultation_type IN (
    'Skin Analysis',
    'Product Recommendation',
    'Beauty Diagnostic',
    'General'
  )),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  notes TEXT,
  amount DECIMAL(10,2),
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_employee ON public.consultations(employee_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created ON public.consultations(created_at);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS consultations_updated_at ON public.consultations;
CREATE TRIGGER consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- RLS: Employees can CRUD their own consultations
CREATE POLICY "consultations_select_own"
  ON public.consultations FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "consultations_insert_own"
  ON public.consultations FOR INSERT
  WITH CHECK (
    auth.uid() = employee_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('employee', 'admin'))
  );

CREATE POLICY "consultations_update_own"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = employee_id)
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "consultations_delete_own"
  ON public.consultations FOR DELETE
  USING (auth.uid() = employee_id);

-- Admin can read all
CREATE POLICY "consultations_select_admin"
  ON public.consultations FOR SELECT
  USING (public.is_admin());
S