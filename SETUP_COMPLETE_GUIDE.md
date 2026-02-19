# 🚀 Guide Complet de Configuration - IVALUX IMPERIAL

Ce guide vous explique **étape par étape** comment configurer l'application pour qu'elle soit complètement fonctionnelle et réaliste.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Supabase](#configuration-supabase)
3. [Migrations SQL (Ordre OBLIGATOIRE)](#migrations-sql)
4. [Configuration Backend](#configuration-backend)
5. [Création des Comptes](#création-des-comptes)
6. [Données de Test](#données-de-test)
7. [Vérification](#vérification)
8. [Dépannage](#dépannage)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Un compte Supabase (gratuit)
- ✅ Node.js installé (v18+)
- ✅ npm ou yarn installé
- ✅ Un projet Supabase créé
- ✅ Les identifiants Supabase (URL, Anon Key, Service Role Key)

---

## 🔧 Configuration Supabase

### Étape 1 : Accéder à Supabase SQL Editor

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet
4. Dans le menu de gauche, cliquez sur **"SQL Editor"**

### Étape 2 : Préparer les fichiers SQL

Tous les fichiers SQL se trouvent dans : `backend/sql/`

Assurez-vous d'avoir ces fichiers :
- ✅ `schema.sql`
- ✅ `rls-policies.sql`
- ✅ `migration-consultations.sql`
- ✅ `migration-complete-schema.sql`
- ✅ `rls-policies-complete.sql`
- ✅ `migration-products-fields.sql` (optionnel mais recommandé)
- ✅ `seed-products.sql` (optionnel - données de test)
- ✅ `seed-consultations.sql` (optionnel - données de test)

---

## 📊 Migrations SQL

### ⚠️ ATTENTION : Ordre OBLIGATOIRE

**Vous DEVEZ exécuter les fichiers dans cet ordre exact. Sinon, vous aurez des erreurs.**

---

### Migration 1 : Schema de Base

**Fichier** : `backend/sql/schema.sql`

**Action** :
1. Ouvrez le fichier `schema.sql`
2. Copiez tout le contenu
3. Dans Supabase SQL Editor, collez le contenu
4. Cliquez sur **"Run"** (ou Ctrl+Enter)

**Ce que ça fait** :
- Crée les tables de base : `profiles`, `products`, `distributors`, `employee_product_handling`, `product_placements`
- Active RLS (Row Level Security) sur toutes les tables
- Crée le trigger pour créer automatiquement un profil lors de l'inscription

**Vérification** :
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'products', 'distributors');
```

Vous devriez voir 3 tables.

---

### Migration 2 : Politiques RLS de Base

**Fichier** : `backend/sql/rls-policies.sql`

**Action** :
1. Ouvrez le fichier `rls-policies.sql`
2. Copiez tout le contenu
3. Dans Supabase SQL Editor, collez le contenu
4. Cliquez sur **"Run"**

**Ce que ça fait** :
- Crée les politiques RLS pour les tables de base
- **CRITIQUE** : Crée la fonction `is_admin()` qui est utilisée partout
- Définit qui peut lire/modifier/supprimer quoi

**Vérification** :
```sql
SELECT public.is_admin();
```

Cela devrait retourner `false` (normal, vous n'êtes pas encore admin).

---

### Migration 3 : Table Consultations

**Fichier** : `backend/sql/migration-consultations.sql`

**Action** :
1. Ouvrez le fichier `migration-consultations.sql`
2. Copiez tout le contenu
3. Dans Supabase SQL Editor, collez le contenu
4. Cliquez sur **"Run"**

**Ce que ça fait** :
- Crée la table `consultations` pour le dashboard employé
- Crée les index pour optimiser les requêtes
- Crée les politiques RLS pour les consultations

**Vérification** :
```sql
SELECT * FROM public.consultations LIMIT 1;
```

Cela devrait fonctionner sans erreur (même si la table est vide).

---

### Migration 4 : Schema Complet (Toutes les Nouvelles Tables)

**Fichier** : `backend/sql/migration-complete-schema.sql`

**Action** :
1. Ouvrez le fichier `migration-complete-schema.sql`
2. Copiez tout le contenu
3. Dans Supabase SQL Editor, collez le contenu
4. Cliquez sur **"Run"**

⚠️ **Cette migration peut prendre quelques secondes** car elle crée beaucoup de tables.

**Ce que ça fait** :
- Crée toutes les tables pour les fonctionnalités avancées :
  - `orders` (commandes)
  - `order_items` (articles de commande)
  - `invoices` (factures)
  - `payments` (paiements)
  - `appointments` (rendez-vous)
  - `messages` (messagerie)
  - `subscriptions` (abonnements)
  - `loyalty_points` (points de fidélité)
  - `point_transactions` (transactions de points)
  - `quests` (quêtes)
  - `client_quests` (quêtes clients)
  - `reviews` (avis)
  - `notifications` (notifications)
  - `client_journey` (parcours client)
  - `analytics_events` (événements analytics)

**Vérification** :
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'invoices', 'appointments', 'messages', 'reviews');
```

Vous devriez voir toutes ces tables.

---

### Migration 5 : Politiques RLS Complètes

**Fichier** : `backend/sql/rls-policies-complete.sql`

**Action** :
1. Ouvrez le fichier `rls-policies-complete.sql`
2. Copiez tout le contenu
3. Dans Supabase SQL Editor, collez le contenu
4. Cliquez sur **"Run"**

**Ce que ça fait** :
- Crée toutes les politiques RLS pour les nouvelles tables
- Définit les permissions pour clients, employés et admins
- Assure la sécurité des données

**Vérification** :
```sql
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```

Vous devriez voir un nombre > 20 (il y a beaucoup de politiques).

---

### Migration 6 : Champs Produits (Optionnel mais Recommandé)

**Fichier** : `backend/sql/migration-products-fields.sql`

**Action** :
1. Ouvrez le fichier `migration-products-fields.sql`
2. Copiez tout le contenu
3. Dans Supabase SQL Editor, collez le contenu
4. Cliquez sur **"Run"**

**Ce que ça fait** :
- Ajoute les colonnes `image_url`, `price`, `category` à la table `products`
- Ces colonnes sont nécessaires pour afficher correctement les produits

**Vérification** :
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('image_url', 'price', 'category');
```

Vous devriez voir ces 3 colonnes.

---

### Migration 7 : Données de Test - Produits (Optionnel)

**Fichier** : `backend/sql/seed-products.sql`

**Action** :
1. Ouvrez le fichier `seed-products.sql`
2. Copiez tout le contenu
3. Dans Supabase SQL Editor, collez le contenu
4. Cliquez sur **"Run"**

**Ce que ça fait** :
- Insère 44 produits du catalogue IVALUX IMPERIAL
- Ajoute des images, prix et catégories
- Rend l'application réaliste avec de vrais produits

**Vérification** :
```sql
SELECT COUNT(*) FROM public.products;
```

Vous devriez voir 44 produits.

---

### Migration 8 : Données de Test - Consultations (Optionnel)

**Fichier** : `backend/sql/seed-consultations.sql`

⚠️ **ATTENTION** : Cette migration nécessite qu'un utilisateur avec `role = 'employee'` existe déjà.

**Action** :
1. **D'ABORD** : Créez un compte employé (voir section "Création des Comptes")
2. Modifiez le fichier `seed-consultations.sql` pour remplacer l'UUID de l'employé par celui de votre employé
3. Ouvrez le fichier modifié
4. Copiez tout le contenu
5. Dans Supabase SQL Editor, collez le contenu
6. Cliquez sur **"Run"**

**Comment trouver l'UUID de l'employé** :
```sql
SELECT id, email, full_name 
FROM auth.users 
WHERE id IN (
  SELECT id FROM public.profiles WHERE role = 'employee'
);
```

**Ce que ça fait** :
- Insère 5 consultations de test pour le dashboard employé

**Vérification** :
```sql
SELECT COUNT(*) FROM public.consultations;
```

Vous devriez voir 5 consultations.

---

## ⚙️ Configuration Backend

### Étape 1 : Créer le fichier .env

1. Allez dans le dossier `backend/`
2. Copiez le fichier `.env.example` vers `.env`
3. Ouvrez `.env` et remplissez les valeurs :

```env
# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# Server
PORT=3001
```

**Où trouver ces valeurs** :
- Allez sur Supabase Dashboard
- Cliquez sur **"Project Settings"** → **"API"**
- Copiez :
  - **Project URL** → `SUPABASE_URL`
  - **anon public** → `SUPABASE_ANON_KEY`
  - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### Étape 2 : Installer les dépendances

```bash
cd backend
npm install
```

### Étape 3 : Démarrer le serveur backend

```bash
npm start
```

Vous devriez voir :
```
IVALUX IMPERIAL API running on http://localhost:3001
```

**Gardez ce terminal ouvert** - le serveur doit tourner en continu.

---

## 👥 Création des Comptes

### Créer un Compte Admin

**Méthode 1 : Via l'application (Recommandé)**

1. Démarrez l'application frontend :
   ```bash
   npm run dev
   ```
2. Allez sur `http://localhost:3000/signup`
3. Créez un compte avec votre email (ex: `admin@ivalux.com`)
4. Connectez-vous avec ce compte
5. Allez sur Supabase SQL Editor et exécutez :

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@ivalux.com'
);
```

**Vérification** :
```sql
SELECT id, email, role 
FROM public.profiles 
WHERE role = 'admin';
```

Vous devriez voir votre compte admin.

---

### Créer un Compte Employé

**Méthode 1 : Via l'application**

1. Allez sur `http://localhost:3000/signup`
2. Créez un compte avec un email différent (ex: `employee@ivalux.com`)
3. Connectez-vous avec ce compte
4. Allez sur Supabase SQL Editor et exécutez :

```sql
UPDATE public.profiles
SET role = 'employee'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'employee@ivalux.com'
);
```

**Vérification** :
```sql
SELECT id, email, role 
FROM public.profiles 
WHERE role = 'employee';
```

---

### Créer un Compte Client (Normal)

**Pas besoin de SQL** - Les nouveaux comptes sont automatiquement des clients.

1. Allez sur `http://localhost:3000/signup`
2. Créez un compte avec un email (ex: `client@example.com`)
3. C'est tout ! Le compte est automatiquement un client.

---

## 🧪 Données de Test

### Créer des Données de Test Manuellement

#### 1. Créer une Commande de Test

```sql
-- D'abord, trouvez l'ID d'un client et d'un produit
SELECT id, email FROM auth.users WHERE id IN (SELECT id FROM public.profiles WHERE role = 'client');
SELECT id, name FROM public.products LIMIT 1;

-- Ensuite, créez une commande (remplacez les UUIDs)
INSERT INTO public.orders (client_id, status, total_amount, shipping_address)
VALUES (
  'UUID-DU-CLIENT',
  'pending',
  150.00,
  '{"street": "123 Main St", "city": "Montreal", "country": "Canada"}'
)
RETURNING id;

-- Créez un article de commande
INSERT INTO public.order_items (order_id, product_id, quantity, price)
VALUES (
  'UUID-DE-LA-COMMANDE',
  'UUID-DU-PRODUIT',
  2,
  75.00
);
```

#### 2. Créer une Facture de Test

```sql
INSERT INTO public.invoices (order_id, client_id, amount, status, due_date)
VALUES (
  'UUID-DE-LA-COMMANDE',
  'UUID-DU-CLIENT',
  150.00,
  'pending',
  NOW() + INTERVAL '30 days'
);
```

#### 3. Créer un Rendez-vous de Test

```sql
-- Trouvez l'ID d'un employé
SELECT id, email FROM auth.users WHERE id IN (SELECT id FROM public.profiles WHERE role = 'employee');

-- Créez un rendez-vous
INSERT INTO public.appointments (client_id, employee_id, appointment_date, appointment_type, status)
VALUES (
  'UUID-DU-CLIENT',
  'UUID-DE-L-EMPLOYE',
  NOW() + INTERVAL '7 days',
  'consultation',
  'scheduled'
);
```

#### 4. Créer des Points de Fidélité

```sql
-- Créez ou mettez à jour les points de fidélité
INSERT INTO public.loyalty_points (client_id, points, lifetime_points, tier)
VALUES (
  'UUID-DU-CLIENT',
  500,
  500,
  'silver'
)
ON CONFLICT (client_id) 
DO UPDATE SET 
  points = loyalty_points.points + 500,
  lifetime_points = loyalty_points.lifetime_points + 500,
  tier = CASE 
    WHEN loyalty_points.lifetime_points + 500 >= 10000 THEN 'diamond'
    WHEN loyalty_points.lifetime_points + 500 >= 5000 THEN 'platinum'
    WHEN loyalty_points.lifetime_points + 500 >= 2000 THEN 'gold'
    WHEN loyalty_points.lifetime_points + 500 >= 500 THEN 'silver'
    ELSE 'bronze'
  END;
```

#### 5. Créer une Quête de Test

```sql
INSERT INTO public.quests (name, description, quest_type, points_reward, is_active)
VALUES (
  'First Purchase',
  'Make your first purchase to earn 100 points',
  'purchase',
  100,
  true
);
```

---

## ✅ Vérification Complète

### Vérification 1 : Toutes les Tables Existent

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Vous devriez voir** :
- analytics_events
- appointments
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

**Total : 21 tables**

---

### Vérification 2 : RLS est Activé

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

Toutes les tables devraient avoir `rowsecurity = true`.

---

### Vérification 3 : Fonction is_admin() Existe

```sql
SELECT public.is_admin();
```

Cela devrait retourner `false` (normal si vous n'êtes pas connecté en tant qu'admin).

---

### Vérification 4 : Backend Fonctionne

1. Ouvrez un navigateur
2. Allez sur `http://localhost:3001/health`
3. Vous devriez voir :
```json
{
  "status": "ok",
  "service": "ivalux-imperial-api"
}
```

---

### Vérification 5 : Frontend Fonctionne

1. Ouvrez un navigateur
2. Allez sur `http://localhost:3000`
3. Vous devriez voir la page d'accueil d'IVALUX IMPERIAL

---

## 🧪 Tests des Fonctionnalités

### Test 1 : Connexion Admin

1. Allez sur `http://localhost:3000/login`
2. Connectez-vous avec votre compte admin
3. Vous devriez être redirigé vers `/dashboard/admin`
4. Vérifiez que vous voyez :
   - Dashboard Admin
   - Section Distribution
   - Section Financial
   - Section Analytics

---

### Test 2 : Connexion Employé

1. Allez sur `http://localhost:3000/login`
2. Connectez-vous avec votre compte employé
3. Vous devriez être redirigé vers `/dashboard/employee`
4. Vérifiez que vous voyez :
   - Dashboard Employé
   - Consultations
   - Produits assignés

---

### Test 3 : Connexion Client

1. Allez sur `http://localhost:3000/login`
2. Connectez-vous avec votre compte client
3. Vous devriez être redirigé vers `/dashboard`
4. Vérifiez que vous voyez :
   - Dashboard Client
   - Commandes
   - Points de fidélité
   - Abonnements

---

### Test 4 : Scanner de Peau IA

1. Connectez-vous en tant que client
2. Allez sur `http://localhost:3000/beauty-scanner`
3. Cliquez sur "Upload Photo" ou "Use Camera"
4. Téléchargez une photo
5. Vérifiez que l'analyse s'affiche

---

### Test 5 : Système de Quêtes

1. Connectez-vous en tant que client
2. Allez sur `http://localhost:3000/dashboard/quests`
3. Vérifiez que vous voyez les quêtes disponibles
4. Cliquez sur "Start Quest" sur une quête
5. Vérifiez que la quête apparaît dans "In Progress"

---

### Test 6 : Reviews

1. Connectez-vous en tant que client
2. Allez sur un produit : `http://localhost:3000/shop/[id]`
3. Cliquez sur "Write Review"
4. Remplissez le formulaire
5. Soumettez la review
6. Vérifiez qu'elle apparaît sur la page produit

---

## 🐛 Dépannage

### Erreur : "Could not find table 'public.consultations'"

**Solution** :
1. Vérifiez que vous avez exécuté `migration-consultations.sql`
2. Vérifiez dans Supabase SQL Editor :
   ```sql
   SELECT * FROM public.consultations LIMIT 1;
   ```

---

### Erreur : "function is_admin() does not exist"

**Solution** :
1. Exécutez `rls-policies.sql` dans Supabase SQL Editor
2. Vérifiez :
   ```sql
   SELECT public.is_admin();
   ```

---

### Erreur : "permission denied for table"

**Solution** :
1. Vérifiez que RLS est activé :
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
2. Vérifiez que les politiques RLS existent :
   ```sql
   SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
   ```
3. Si le nombre est faible, réexécutez `rls-policies-complete.sql`

---

### Erreur : Backend ne démarre pas

**Solution** :
1. Vérifiez que le fichier `.env` existe dans `backend/`
2. Vérifiez que toutes les variables sont remplies
3. Vérifiez que le port 3001 n'est pas utilisé :
   ```bash
   # Windows
   netstat -ano | findstr :3001
   
   # Mac/Linux
   lsof -i :3001
   ```

---

### Erreur : Frontend ne peut pas se connecter au backend

**Solution** :
1. Vérifiez que le backend tourne sur `http://localhost:3001`
2. Vérifiez le fichier `next.config.js` :
   ```javascript
   const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
   ```
3. Vérifiez que `BACKEND_URL` dans `.env.local` (frontend) pointe vers le bon URL

---

### Erreur : "Invalid API key" ou "JWT expired"

**Solution** :
1. Vérifiez que les clés Supabase dans `.env` sont correctes
2. Allez sur Supabase Dashboard → Project Settings → API
3. Copiez les nouvelles clés si nécessaire
4. Redémarrez le backend

---

### Erreur : Les produits ne s'affichent pas

**Solution** :
1. Vérifiez que vous avez exécuté `seed-products.sql`
2. Vérifiez dans Supabase :
   ```sql
   SELECT COUNT(*) FROM public.products;
   ```
3. Si 0, exécutez `seed-products.sql` à nouveau

---

## 📝 Checklist Finale

Avant de considérer l'application comme "prête", vérifiez :

- [ ] Toutes les migrations SQL ont été exécutées dans l'ordre
- [ ] Le fichier `.env` du backend est configuré
- [ ] Le backend démarre sans erreur
- [ ] Le frontend démarre sans erreur
- [ ] Un compte admin existe et peut se connecter
- [ ] Un compte employé existe et peut se connecter
- [ ] Un compte client existe et peut se connecter
- [ ] Les produits s'affichent dans `/shop`
- [ ] Le dashboard admin fonctionne
- [ ] Le dashboard employé fonctionne
- [ ] Le dashboard client fonctionne
- [ ] Le scanner de peau fonctionne
- [ ] Les quêtes fonctionnent
- [ ] Les reviews fonctionnent

---

## 🎉 Félicitations !

Si toutes les vérifications passent, votre application IVALUX IMPERIAL est maintenant **complètement fonctionnelle** !

Vous pouvez maintenant :
- ✅ Tester toutes les fonctionnalités
- ✅ Créer de vraies données
- ✅ Inviter des utilisateurs
- ✅ Commencer à utiliser l'application en production

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du backend dans le terminal
2. Vérifiez la console du navigateur (F12)
3. Vérifiez les logs Supabase dans le dashboard
4. Consultez la section "Dépannage" ci-dessus

---

**Version** : 1.0.0  
**Dernière mise à jour** : Février 2026
