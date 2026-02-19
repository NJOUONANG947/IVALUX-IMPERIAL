# Guide de Migration SQL - IVALUX IMPERIAL

## 📋 Ordre d'exécution OBLIGATOIRE

Exécuter ces fichiers dans l'éditeur SQL Supabase **dans cet ordre exact** :

### 1. **schema.sql**
- Tables de base (profiles, products, distributors, etc.)
- Triggers et fonctions de base
- Active RLS sur toutes les tables

### 2. **rls-policies.sql**
- Politiques RLS pour les tables de base
- Crée la fonction `is_admin()`
- ⚠️ **CRITIQUE** : Doit être exécuté avant migration-consultations.sql

### 3. **migration-consultations.sql**
- Table `consultations` pour le dashboard employé
- Utilise `is_admin()` donc nécessite rls-policies.sql
- Triggers pour updated_at

### 4. **migration-complete-schema.sql**
- Toutes les nouvelles tables (orders, invoices, payments, appointments, messages, subscriptions, loyalty, etc.)
- Index et triggers
- Active RLS

### 5. **rls-policies-complete.sql**
- Politiques RLS pour toutes les nouvelles tables
- Accès basé sur les rôles

### 6. **seed-products.sql** (Optionnel)
- Insère 44 produits du catalogue IVALUX
- Ajoute les colonnes image_url, price, category si elles n'existent pas

### 7. **seed-consultations.sql** (Optionnel)
- Données de test pour consultations
- ⚠️ Nécessite au moins un utilisateur avec `role = 'employee'`

---

## ✅ Vérification

Après migration, vérifier que toutes les tables existent :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Vous devriez voir :
- appointments
- analytics_events
- client_journey
- client_quests
- consultations
- distributors
- employee_product_handling
- invoices
- loyalty_points
- messages
- notifications
- order_items
- orders
- payments
- point_transactions
- product_placements
- products
- profiles
- quests
- reviews
- subscriptions

---

## 🔧 Créer un Admin

```sql
-- 1. S'inscrire via l'app avec votre email
-- 2. Puis exécuter :
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'votre-email@exemple.com'
);
```

## 👤 Créer un Employé

```sql
-- 1. S'inscrire via l'app
-- 2. Puis exécuter :
UPDATE public.profiles
SET role = 'employee'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'employe@exemple.com'
);
```

---

## 🐛 Résolution de problèmes

### Erreur "Could not find table"
→ Vérifier que toutes les migrations ont été exécutées dans l'ordre

### Erreur "function is_admin() does not exist"
→ Exécuter `rls-policies.sql` avant `migration-consultations.sql`

### Erreur de permissions
→ Vérifier que RLS est activé et que les politiques sont créées

---

## 📊 Statistiques après migration

Pour vérifier que tout fonctionne :

```sql
-- Nombre de tables
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Nombre de politiques RLS
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';

-- Vérifier is_admin()
SELECT public.is_admin();
```
