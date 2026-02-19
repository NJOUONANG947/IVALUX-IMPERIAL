# IVALUX IMPERIAL - Schema Installation Guide

## Ordre d'exécution des schémas SQL

Pour éviter les erreurs de dépendances, exécutez les schémas dans cet ordre :

### 1. Schéma de base (obligatoire)
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: backend/sql/schema.sql
```
Crée les tables de base : `profiles`, `products`, `distributors`, `employee_product_handling`, `product_placements`

### 2. Schéma complet (recommandé)
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: backend/sql/migration-complete-schema.sql
```
Crée les tables : `orders`, `order_items`, `invoices`, `payments`, `appointments`, `messages`, `subscriptions`, `reviews`, `notifications`, `loyalty_points`, `quests`, `client_quests`

### 3. Consultations (si pas déjà inclus)
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: backend/sql/migration-consultations.sql
```
Crée la table `consultations`

### 4. Schéma fonctionnalités avancées (SAFE VERSION)
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: backend/sql/schema-advanced-features-safe.sql
```
**Cette version crée automatiquement les tables manquantes si elles n'existent pas.**

Crée toutes les tables pour :
- Analyse comportementale
- Sentiment analysis
- Métavers
- Marketplace B2B2C
- IoT devices
- Formulations personnalisées
- Gamification avancée

### Alternative : Schéma avancé standard
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: backend/sql/schema-advanced-features.sql
```
**ATTENTION : Cette version nécessite que toutes les tables de base existent déjà.**

### 5. RLS Policies
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: backend/sql/rls-policies.sql
```
Configure les politiques de sécurité Row Level Security

### 6. Migrations supplémentaires
```sql
-- Exécuter si nécessaire
-- Fichier: backend/sql/migration-employee-handling-delete.sql
```

## Solution rapide pour l'erreur "products does not exist"

Si vous obtenez l'erreur `relation "public.products" does not exist`, utilisez la version **SAFE** :

```sql
-- Exécutez ce fichier qui crée automatiquement les tables manquantes
-- backend/sql/schema-advanced-features-safe.sql
```

Cette version vérifie et crée toutes les tables nécessaires avant de créer les références.
