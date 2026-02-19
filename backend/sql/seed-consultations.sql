-- =====================================================
-- IVALUX IMPERIAL - Seed sample consultations for employees
-- Run after migration-consultations.sql
-- Requires at least one employee in profiles (role = 'employee')
-- =====================================================

INSERT INTO public.consultations (employee_id, client_name, consultation_type, status, notes, amount, satisfaction_rating, created_at)
SELECT p.id, 'Victoria L.', 'Skin Analysis', 'completed', 'Client satisfied with Blanche range recommendation', 450, 5, NOW() - INTERVAL '2 hours'
FROM public.profiles p WHERE p.role = 'employee' LIMIT 1;

INSERT INTO public.consultations (employee_id, client_name, consultation_type, status, notes, amount, satisfaction_rating, created_at)
SELECT p.id, 'Isabella R.', 'Product Recommendation', 'in_progress', NULL, NULL, NULL, NOW() - INTERVAL '45 minutes'
FROM public.profiles p WHERE p.role = 'employee' LIMIT 1;

INSERT INTO public.consultations (employee_id, client_name, consultation_type, status, notes, amount, satisfaction_rating, created_at)
SELECT p.id, 'Catherine M.', 'Beauty Diagnostic', 'scheduled', NULL, NULL, NULL, NOW()
FROM public.profiles p WHERE p.role = 'employee' LIMIT 1;

INSERT INTO public.consultations (employee_id, client_name, consultation_type, status, notes, amount, satisfaction_rating, created_at)
SELECT p.id, 'Marie D.', 'Skin Analysis', 'completed', NULL, 200, 4, NOW() - INTERVAL '1 day'
FROM public.profiles p WHERE p.role = 'employee' LIMIT 1;

INSERT INTO public.consultations (employee_id, client_name, consultation_type, status, notes, amount, satisfaction_rating, created_at)
SELECT p.id, 'Sophie L.', 'Product Recommendation', 'completed', NULL, 130, 5, NOW() - INTERVAL '3 days'
FROM public.profiles p WHERE p.role = 'employee' LIMIT 1;
