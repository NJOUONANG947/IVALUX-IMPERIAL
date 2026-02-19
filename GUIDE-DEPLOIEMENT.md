# 🚀 GUIDE COMPLET - Rendre l'Application IVALUX IMPERIAL Fonctionnelle

Ce guide vous explique **étape par étape** comment rendre votre application complètement opérationnelle.

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Configuration Supabase](#configuration-supabase)
3. [Installation des dépendances](#installation-des-dépendances)
4. [Configuration de la base de données](#configuration-de-la-base-de-données)
5. [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
6. [Démarrage de l'application](#démarrage-de-lapplication)
7. [Vérification du fonctionnement](#vérification-du-fonctionnement)
8. [Intégrations optionnelles](#intégrations-optionnelles)
9. [Dépannage](#dépannage)

---

## ✅ PRÉREQUIS

Avant de commencer, assurez-vous d'avoir :

- ✅ **Node.js** (version 18 ou supérieure)
- ✅ **npm** ou **yarn**
- ✅ **Compte Supabase** (gratuit) - [https://supabase.com](https://supabase.com)
- ✅ **Git** (optionnel, pour le contrôle de version)

---

## 🔧 CONFIGURATION SUPABASE

### Étape 1 : Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte (gratuit)
3. Créez un nouveau projet
4. Notez les informations suivantes :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **Anon Key** (clé publique)
   - **Service Role Key** (clé secrète - gardez-la privée !)

### Étape 2 : Activer l'authentification

Dans le dashboard Supabase :
1. Allez dans **Authentication** → **Providers**
2. Activez **Email** (déjà activé par défaut)
3. Optionnel : Configurez d'autres providers (Google, GitHub, etc.)

---

## 📦 INSTALLATION DES DÉPENDANCES

### Frontend (Next.js)

```bash
# À la racine du projet
npm install
```

### Backend (Express API)

```bash
# Dans le dossier backend
cd backend
npm install
```

---

## 🗄️ CONFIGURATION DE LA BASE DE DONNÉES

### Ordre d'exécution IMPORTANT

Exécutez les schémas SQL dans cet ordre exact dans le **SQL Editor** de Supabase :

### 1️⃣ Schéma de base (OBLIGATOIRE)

```sql
-- Fichier: backend/sql/schema.sql
-- Crée les tables de base : profiles, products, distributors, etc.
```

**Comment faire :**
1. Ouvrez Supabase Dashboard → **SQL Editor**
2. Cliquez sur **New Query**
3. Copiez-collez le contenu de `backend/sql/schema.sql`
4. Cliquez sur **Run**

### 2️⃣ Schéma complet (RECOMMANDÉ)

```sql
-- Fichier: backend/sql/migration-complete-schema.sql
-- Crée : orders, invoices, appointments, subscriptions, reviews, etc.
```

**Exécutez de la même manière dans le SQL Editor.**

### 3️⃣ Schéma des consultations

```sql
-- Fichier: backend/sql/migration-consultations.sql
-- Crée la table consultations
```

### 4️⃣ Schéma fonctionnalités avancées (SAFE VERSION)

```sql
-- Fichier: backend/sql/schema-advanced-features-safe.sql
-- ⚠️ UTILISEZ LA VERSION "SAFE" qui crée automatiquement les tables manquantes
-- Crée toutes les tables pour : analytics, sentiment, metaverse, marketplace, IoT, etc.
```

### 5️⃣ Politiques RLS (Row Level Security)

```sql
-- Fichier: backend/sql/rls-policies.sql
-- Configure les permissions de sécurité
```

### 6️⃣ Migrations supplémentaires (si nécessaire)

```sql
-- Fichier: backend/sql/migration-employee-handling-delete.sql
```

---

## 🔐 CONFIGURATION DES VARIABLES D'ENVIRONNEMENT

### Backend (.env)

Créez/modifiez le fichier `backend/.env` :

```env
# Supabase Configuration
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

# Server Configuration
PORT=3001
```

**Où trouver ces valeurs :**
- Supabase Dashboard → **Project Settings** → **API**
- Copiez les valeurs dans votre fichier `.env`

### Frontend (.env.local)

Créez le fichier `.env.local` à la racine du projet :

```env
# Backend API URL (pour le développement local)
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
```

---

## 🚀 DÉMARRAGE DE L'APPLICATION

### Option 1 : Démarrage séparé (recommandé pour le développement)

**Terminal 1 - Backend :**
```bash
cd backend
npm start
# ou pour le développement avec auto-reload :
npm run dev
```

**Terminal 2 - Frontend :**
```bash
# À la racine du projet
npm run dev
```

### Option 2 : Démarrage simultané

```bash
# À la racine du projet
npm run dev:all
```

**L'application sera accessible sur :**
- Frontend : http://localhost:3000
- Backend API : http://localhost:3001

---

## ✅ VÉRIFICATION DU FONCTIONNEMENT

### 1. Vérifier le backend

```bash
# Testez l'endpoint de santé
curl http://localhost:3001/health

# Devrait retourner :
# {"status":"ok","service":"ivalux-imperial-api"}
```

### 2. Vérifier le frontend

1. Ouvrez http://localhost:3000
2. Vous devriez voir la page d'accueil
3. Testez la navigation

### 3. Tester l'authentification

1. Cliquez sur **Login** ou **Sign Up**
2. Créez un compte de test
3. Vérifiez que vous pouvez vous connecter

### 4. Vérifier la base de données

Dans Supabase Dashboard → **Table Editor**, vous devriez voir :
- ✅ `profiles` (avec votre utilisateur créé)
- ✅ `products`
- ✅ Toutes les autres tables créées

---

## 🔌 INTÉGRATIONS OPTIONNELLES

### 1. Paiements (Stripe/PayPal)

**Stripe :**
```env
# Ajoutez dans backend/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**PayPal :**
```env
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
```

### 2. Email (SendGrid/Resend)

```env
# Ajoutez dans backend/.env
SENDGRID_API_KEY=SG....
# ou
RESEND_API_KEY=re_...
```

### 3. Stockage de fichiers (Supabase Storage)

1. Dans Supabase Dashboard → **Storage**
2. Créez un bucket `product-images`
3. Configurez les politiques de sécurité

### 4. IA (OpenAI/Anthropic)

Pour les fonctionnalités IA avancées :

```env
# Ajoutez dans backend/.env
OPENAI_API_KEY=sk-...
# ou
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🐛 DÉPANNAGE

### Erreur : "Port 3001 already in use"

**Solution :**
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Ou utilisez le script fourni :
.\backend\kill-port-3001.ps1
```

**Ou changez le port dans `backend/.env` :**
```env
PORT=3002
```

### Erreur : "relation 'public.products' does not exist"

**Solution :**
1. Vérifiez que vous avez exécuté `schema.sql` en premier
2. Utilisez `schema-advanced-features-safe.sql` au lieu de `schema-advanced-features.sql`
3. Vérifiez dans Supabase Dashboard → **Table Editor** que les tables existent

### Erreur : "Supabase credentials missing"

**Solution :**
1. Vérifiez que `backend/.env` existe
2. Vérifiez que les clés Supabase sont correctes
3. Redémarrez le serveur backend

### Erreur : "Cannot connect to backend"

**Solution :**
1. Vérifiez que le backend est démarré (`npm start` dans `backend/`)
2. Vérifiez que le port est correct (3001 par défaut)
3. Vérifiez `next.config.js` pour les rewrites

### Erreur d'authentification

**Solution :**
1. Vérifiez que l'authentification Email est activée dans Supabase
2. Vérifiez que le trigger `on_auth_user_created` existe dans la base de données
3. Vérifiez les politiques RLS dans `rls-policies.sql`

---

## 📝 CHECKLIST DE DÉPLOIEMENT

Avant de déployer en production, vérifiez :

### Base de données
- [ ] Tous les schémas SQL ont été exécutés
- [ ] Les politiques RLS sont configurées
- [ ] Les triggers fonctionnent correctement
- [ ] Les index sont créés pour les performances

### Backend
- [ ] Les variables d'environnement sont configurées
- [ ] Le serveur démarre sans erreur
- [ ] Les routes API répondent correctement
- [ ] L'authentification fonctionne

### Frontend
- [ ] Le build fonctionne (`npm run build`)
- [ ] Les variables d'environnement sont configurées
- [ ] Les rewrites Next.js pointent vers le bon backend
- [ ] Les images sont optimisées

### Sécurité
- [ ] Les clés secrètes ne sont pas dans le code
- [ ] Le `.env` est dans `.gitignore`
- [ ] Les politiques RLS sont activées
- [ ] CORS est configuré correctement

---

## 🎯 PROCHAINES ÉTAPES

Une fois l'application fonctionnelle :

1. **Créer des données de test**
   - Ajoutez des produits via le dashboard admin
   - Créez des utilisateurs de test (client, employee, admin)

2. **Tester les fonctionnalités**
   - Authentification
   - Gestion des produits
   - Commandes
   - Factures
   - Consultations

3. **Configurer les intégrations**
   - Paiements
   - Email
   - Stockage de fichiers

4. **Optimiser les performances**
   - Ajouter des index supplémentaires si nécessaire
   - Configurer le cache
   - Optimiser les images

---

## 📞 SUPPORT

Si vous rencontrez des problèmes :

1. Vérifiez les logs du backend (`console.log` dans le terminal)
2. Vérifiez les logs du frontend (Console du navigateur)
3. Vérifiez les logs Supabase (Dashboard → Logs)
4. Consultez la documentation Supabase : [https://supabase.com/docs](https://supabase.com/docs)

---

## 🎉 FÉLICITATIONS !

Votre application IVALUX IMPERIAL est maintenant fonctionnelle ! 🚀
