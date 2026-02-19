# IVALUX IMPERIAL - Plateforme Beauté Luxe Complète

## 🎯 Vue d'ensemble

**IVALUX IMPERIAL** est une plateforme web révolutionnaire de gestion beauté luxe avec IA, permettant à l'administrateur au Canada de suivre toutes les opérations en temps réel : finances, facturations, ventes, consultations, et interactions clients-employés.

---

## 🏗️ Architecture

### **Frontend**
- **Framework** : Next.js 14 (App Router)
- **UI** : React, Tailwind CSS, Framer Motion
- **Multilingue** : FR/EN avec système i18n
- **Responsive** : Mobile-first, PWA-ready

### **Backend**
- **Runtime** : Node.js + Express
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (JWT)
- **Sécurité** : Row Level Security (RLS)

---

## 📦 Fonctionnalités principales

### 1. **Dashboard Admin** (`/dashboard/admin`)
- ✅ Vue d'ensemble en temps réel
- ✅ **Module financier** (`/dashboard/admin/financial`)
  - Revenus par période (jour, semaine, mois, année)
  - Revenus par pays (CA, US, FR, BE)
  - Revenus par employé
  - Graphiques interactifs
- ✅ **Gestion des factures** (`/dashboard/admin/invoices`)
  - Génération automatique
  - Suivi des paiements
  - Statuts (draft, sent, paid, overdue)
- ✅ Gestion des distributeurs
- ✅ Analytics avancés

### 2. **Dashboard Employé** (`/dashboard/employee`)
- ✅ Statistiques (consultations du jour, ventes hebdo, satisfaction)
- ✅ Gestion des consultations (création, mise à jour, notes)
- ✅ Produits assignés par pays
- ✅ Suivi des clients

### 3. **Dashboard Client** (`/dashboard`)
- ✅ Profil beauté personnalisé
- ✅ Commandes récentes
- ✅ Points de fidélité et tier
- ✅ Abonnements actifs
- ✅ Liens rapides (Appointments, Messages, Shop)

### 4. **Système de rendez-vous** (`/dashboard/appointments`)
- ✅ Prise de rendez-vous en ligne
- ✅ Calendrier intégré
- ✅ Gestion des statuts
- ✅ Notifications automatiques

### 5. **Messagerie client-employé** (`/dashboard/messages`)
- ✅ Chat en temps réel
- ✅ Historique des conversations
- ✅ Notifications de nouveaux messages
- ✅ Partage de fichiers (préparé)

### 6. **Système de commandes**
- ✅ Création de commandes
- ✅ Suivi des statuts
- ✅ Gestion des items
- ✅ Calcul automatique (taxes, shipping)

### 7. **Programme de fidélité**
- ✅ Points par achat
- ✅ Tiers (Bronze, Silver, Gold, Platinum, Diamond)
- ✅ Quêtes et défis
- ✅ Transactions tracées

### 8. **Abonnements**
- ✅ Plans (mensuel, trimestriel, semestriel, annuel)
- ✅ Pause/reprise
- ✅ Renouvellement automatique
- ✅ Personnalisation

### 9. **Assistant IA Luxy**
- ✅ Recommandations produits
- ✅ Consultations beauté
- ✅ Support multilingue
- ✅ Chat intégré

### 10. **Multilingue**
- ✅ FR/EN avec sélecteur dans le header
- ✅ Traductions complètes
- ✅ Préférence sauvegardée

---

## 🗄️ Base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `profiles` | Utilisateurs (client, employee, admin) |
| `products` | Catalogue produits |
| `orders` | Commandes clients |
| `order_items` | Items des commandes |
| `invoices` | Factures |
| `payments` | Paiements |
| `consultations` | Consultations employé-client |
| `appointments` | Rendez-vous |
| `messages` | Messages client-employé |
| `subscriptions` | Abonnements |
| `loyalty_points` | Points de fidélité |
| `point_transactions` | Transactions de points |
| `quests` | Quêtes gamification |
| `client_quests` | Progression des quêtes |
| `reviews` | Avis produits |
| `notifications` | Notifications système |
| `product_placements` | Tracking IA |
| `distributors` | Distributeurs |
| `employee_product_handling` | Produits assignés aux employés |
| `client_journey` | Parcours client |
| `analytics_events` | Événements analytics |

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- Compte Supabase
- npm ou yarn

### 1. Cloner et installer

```bash
cd IMPERIAL
npm install
cd backend
npm install
```

### 2. Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Copier les credentials dans `backend/.env` :
```env
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Exécuter les migrations SQL

Dans l'éditeur SQL Supabase, exécuter dans cet ordre :

1. `backend/sql/schema.sql`
2. `backend/sql/rls-policies.sql`
3. `backend/sql/migration-consultations.sql`
4. `backend/sql/migration-complete-schema.sql`
5. `backend/sql/rls-policies-complete.sql`
6. `backend/sql/seed-products.sql` (optionnel)
7. `backend/sql/seed-consultations.sql` (optionnel, nécessite un employé)

### 4. Créer un compte admin

```sql
-- Après inscription, exécuter :
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'votre-email@exemple.com');
```

### 5. Lancer l'application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

Ou avec concurrently :
```bash
npm run dev:all
```

---

## 📡 API Endpoints

### Auth
- `POST /auth/login` - Connexion
- `POST /auth/signup` - Inscription
- `POST /auth/logout` - Déconnexion
- `GET /auth/me` - Profil utilisateur

### Products
- `GET /products` - Liste produits
- `GET /products/:id` - Détail produit

### Orders
- `GET /orders` - Liste commandes
- `POST /orders` - Créer commande
- `GET /orders/:id` - Détail commande
- `PATCH /orders/:id` - Mettre à jour statut

### Invoices (Admin)
- `GET /invoices` - Liste factures
- `POST /invoices` - Créer facture
- `GET /invoices/:id` - Détail facture
- `PATCH /invoices/:id` - Mettre à jour statut

### Appointments
- `GET /appointments` - Liste rendez-vous
- `POST /appointments` - Créer rendez-vous
- `PATCH /appointments/:id` - Mettre à jour

### Messages
- `GET /messages` - Conversations
- `GET /messages/:userId` - Messages avec utilisateur
- `POST /messages` - Envoyer message
- `PATCH /messages/:id/read` - Marquer lu

### Financial (Admin)
- `GET /financial/dashboard` - Dashboard financier
- `GET /financial/revenue` - Analytics revenus
- `GET /financial/payments` - Suivi paiements

### Loyalty
- `GET /loyalty/points` - Points client
- `POST /loyalty/points/earn` - Gagner points
- `GET /loyalty/quests` - Quêtes disponibles
- `GET /loyalty/quests/my` - Mes quêtes
- `POST /loyalty/quests/:id/complete` - Compléter quête

### Subscriptions
- `GET /subscriptions` - Liste abonnements
- `POST /subscriptions` - Créer abonnement
- `POST /subscriptions/:id/pause` - Pause
- `POST /subscriptions/:id/resume` - Reprendre

### Employee
- `GET /employee/dashboard` - Dashboard employé
- `GET /employee/consultations` - Consultations
- `POST /employee/consultations` - Créer consultation
- `PATCH /employee/consultations/:id` - Mettre à jour

### Admin
- `GET /admin/distributors` - Distributeurs
- `POST /admin/distributors` - Créer distributeur
- `GET /admin/product-handlings` - Assignations produits

---

## 🎨 Structure du projet

```
IMPERIAL/
├── app/                          # Next.js App Router
│   ├── dashboard/
│   │   ├── admin/               # Dashboard admin
│   │   │   ├── financial/      # Module financier
│   │   │   ├── invoices/       # Gestion factures
│   │   │   └── distribution/   # Distribution
│   │   ├── employee/           # Dashboard employé
│   │   ├── appointments/        # Rendez-vous
│   │   └── messages/          # Messagerie
│   ├── shop/                   # Boutique
│   ├── diagnostic/             # Diagnostic beauté
│   └── ...
├── backend/                     # API Express
│   ├── routes/                 # Routes API
│   ├── middleware/            # Auth, roles
│   ├── sql/                   # Migrations SQL
│   └── index.js              # Serveur Express
├── components/                # Composants React
│   ├── layout/               # Header, Footer
│   ├── auth/                # Routes protégées
│   └── chat/                # Assistant Luxy
├── lib/                      # Utilitaires
│   ├── api.js               # Client API
│   ├── AuthContext.js       # Contexte auth
│   ├── i18n.js             # Internationalisation
│   └── motion.js           # Animations
└── messages/                # Traductions
    ├── en.json
    └── fr.json
```

---

## 🔐 Sécurité

- **Row Level Security (RLS)** : Accès basé sur les rôles
- **JWT Authentication** : Tokens sécurisés
- **Role-based access** : Client, Employee, Admin
- **Data isolation** : Chaque utilisateur voit uniquement ses données

---

## 🌍 Multilingue

- **Langues** : Français (défaut), Anglais
- **Sélecteur** : Header (FR | EN)
- **Préférence** : Sauvegardée dans localStorage
- **Traductions** : Toutes les pages et composants

---

## 📊 Fonctionnalités révolutionnaires implémentées

✅ **Module financier complet**
- Revenus en temps réel
- Facturation automatique
- Suivi des paiements
- Analytics par pays/employé

✅ **Connexion clients-employés**
- Système de rendez-vous
- Chat en temps réel
- Notifications push

✅ **Programme de fidélité**
- Points et tiers
- Quêtes gamifiées
- Transactions tracées

✅ **Abonnements intelligents**
- Plans flexibles
- Pause/reprise
- Renouvellement automatique

---

## 🚧 Fonctionnalités futures

- Scanner de peau IA (AR)
- Réalité augmentée pour essai produits
- Blockchain et NFT pour authenticité
- Métavers et boutique virtuelle
- Intégrations externes (Stripe, PayPal)
- Application mobile native
- Analytics prédictifs avec ML

---

## 📝 Notes importantes

1. **Migration SQL** : Exécuter toutes les migrations dans l'ordre
2. **Admin** : Créer un compte puis mettre à jour le rôle en SQL
3. **Employé** : Même processus pour créer un employé
4. **Backend** : Doit tourner sur le port 3001
5. **Frontend** : Utilise les rewrites Next.js pour proxy vers backend

---

## 🎯 Résultat

L'administrateur au Canada peut maintenant :
- ✅ Suivre toutes les finances en temps réel
- ✅ Gérer les facturations et paiements
- ✅ Voir les interactions clients-employés
- ✅ Analyser les performances par pays/employé
- ✅ Gérer les produits et distributeurs
- ✅ Suivre le parcours client complet

**Application complète et opérationnelle !** 🚀
