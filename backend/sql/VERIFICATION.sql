-- =====================================================
-- IVALUX IMPERIAL - Script de Vérification
-- Exécutez ce script APRÈS toutes les migrations
-- =====================================================

-- 1. Vérifier que toutes les tables existent
SELECT 
  'Tables' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 21 THEN '✅ OK'
    ELSE '❌ MANQUANTES'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'analytics_events',
  'appointments',
  'client_journey',
  'client_quests',
  'consultations',
  'distributors',
  'employee_product_handling',
  'invoices',
  'loyalty_points',
  'messages',
  'notifications',
  'order_items',
  'orders',
  'payments',
  'point_transactions',
  'product_placements',
  'products',
  'profiles',
  'quests',
  'reviews',
  'subscriptions'
);

-- 2. Vérifier que RLS est activé sur toutes les tables
SELECT 
  'RLS Enabled' as check_type,
  COUNT(*) as tables_with_rls,
  CASE 
    WHEN COUNT(*) >= 21 THEN '✅ OK'
    ELSE '❌ MANQUANT'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- 3. Vérifier que la fonction is_admin() existe
SELECT 
  'is_admin() function' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'is_admin'
    ) THEN '✅ OK'
    ELSE '❌ MANQUANTE'
  END as status;

-- 4. Vérifier le nombre de politiques RLS
SELECT 
  'RLS Policies' as check_type,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 30 THEN '✅ OK'
    WHEN COUNT(*) >= 20 THEN '⚠️ PARTIEL'
    ELSE '❌ INSUFFISANT'
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- 5. Vérifier les colonnes de la table products
SELECT 
  'Products columns' as check_type,
  COUNT(*) as column_count,
  CASE 
    WHEN COUNT(*) >= 7 THEN '✅ OK'
    ELSE '❌ MANQUANTES'
  END as status
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('id', 'name', 'description', 'image_url', 'price', 'category', 'created_at');

-- 6. Vérifier les colonnes de la table profiles
SELECT 
  'Profiles columns' as check_type,
  COUNT(*) as column_count,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ OK'
    ELSE '❌ MANQUANTES'
  END as status
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('id', 'role', 'full_name', 'country', 'created_at');

-- 7. Vérifier les triggers importants
SELECT 
  'Triggers' as check_type,
  COUNT(*) as trigger_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ OK'
    ELSE '⚠️ PARTIEL'
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('on_auth_user_created', 'set_updated_at', 'generate_invoice_number');

-- 8. Liste de toutes les tables avec leur statut RLS
SELECT 
  tablename as table_name,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé'
  END as rls_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = t.tablename
    ) THEN '✅ Politiques'
    ELSE '⚠️ Pas de politiques'
  END as policies_status
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- 9. Résumé final
SELECT 
  '=== RÉSUMÉ FINAL ===' as summary,
  '' as details;

SELECT 
  'Total tables' as metric,
  COUNT(*)::text as value
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT 
  'Tables avec RLS' as metric,
  COUNT(*)::text as value
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

SELECT 
  'Politiques RLS' as metric,
  COUNT(*)::text as value
FROM pg_policies 
WHERE schemaname = 'public';

SELECT 
  'Produits' as metric,
  COUNT(*)::text as value
FROM public.products;

SELECT 
  'Utilisateurs' as metric,
  COUNT(*)::text as value
FROM public.profiles;

SELECT 
  'Admins' as metric,
  COUNT(*)::text as value
FROM public.profiles 
WHERE role = 'admin';

SELECT 
  'Employés' as metric,
  COUNT(*)::text as value
FROM public.profiles 
WHERE role = 'employee';

SELECT 
  'Clients' as metric,
  COUNT(*)::text as value
FROM public.profiles 
WHERE role = 'client';
