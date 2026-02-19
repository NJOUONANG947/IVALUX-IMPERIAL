-- =====================================================
-- IVALUX IMPERIAL - Row Level Security Policies
-- Run in Supabase SQL Editor
-- =====================================================
-- Enforces: clients own data | employees operational | admin full access
-- RLS must already be enabled on all tables (see schema.sql)
-- =====================================================

-- Drop existing policies on our tables (allows clean re-run)
DO $$
DECLARE
  r RECORD;
  tables TEXT[] := ARRAY['profiles', 'products', 'distributors', 'employee_product_handling', 'product_placements'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, t);
    END LOOP;
  END LOOP;
END $$;

-- Helper: check if current user is admin (avoids repeated subqueries)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =====================================================
-- 1. PROFILES
-- =====================================================
-- Users can read/update their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can update all profiles
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- 2. PRODUCTS
-- =====================================================
-- Authenticated users can read products only
CREATE POLICY "products_select_authenticated"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

-- Admin only: insert products
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin only: update products
CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin only: delete products
CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- 3. DISTRIBUTORS
-- =====================================================
-- Admin only: read distributors
CREATE POLICY "distributors_select_admin"
  ON public.distributors FOR SELECT
  USING (public.is_admin());

-- Admin only: insert distributors
CREATE POLICY "distributors_insert_admin"
  ON public.distributors FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin only: update distributors
CREATE POLICY "distributors_update_admin"
  ON public.distributors FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin only: delete distributors
CREATE POLICY "distributors_delete_admin"
  ON public.distributors FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- 4. EMPLOYEE_PRODUCT_HANDLING
-- =====================================================
-- Employees can insert rows for themselves (role must be employee)
CREATE POLICY "employee_handling_insert_own"
  ON public.employee_product_handling FOR INSERT
  WITH CHECK (
    auth.uid() = employee_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employee')
  );

-- Employees can read only their own rows
CREATE POLICY "employee_handling_select_own"
  ON public.employee_product_handling FOR SELECT
  USING (auth.uid() = employee_id);

-- Admin can read all rows
CREATE POLICY "employee_handling_select_admin"
  ON public.employee_product_handling FOR SELECT
  USING (public.is_admin());

-- Admin can insert (for any employee)
CREATE POLICY "employee_handling_insert_admin"
  ON public.employee_product_handling FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin can update
CREATE POLICY "employee_handling_update_admin"
  ON public.employee_product_handling FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin can delete
CREATE POLICY "employee_handling_delete_admin"
  ON public.employee_product_handling FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- 5. PRODUCT_PLACEMENTS
-- =====================================================
-- Authenticated users can insert their own placements
CREATE POLICY "product_placements_insert_own"
  ON public.product_placements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can read all placements (no one else can read)
CREATE POLICY "product_placements_select_admin"
  ON public.product_placements FOR SELECT
  USING (public.is_admin());

-- Admin can update/delete (full access)
CREATE POLICY "product_placements_update_admin"
  ON public.product_placements FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "product_placements_delete_admin"
  ON public.product_placements FOR DELETE
  USING (public.is_admin());
