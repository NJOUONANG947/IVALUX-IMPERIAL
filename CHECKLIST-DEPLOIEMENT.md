# ✅ CHECKLIST DE DÉPLOIEMENT - IVALUX IMPERIAL

Utilisez cette checklist pour vérifier que tout est prêt avant de démarrer l'application.

## 🔧 CONFIGURATION INITIALE

### Supabase
- [ ] Compte Supabase créé
- [ ] Projet Supabase créé
- [ ] URL du projet notée
- [ ] Anon Key copiée
- [ ] Service Role Key copiée (⚠️ SECRÈTE)
- [ ] Authentification Email activée

### Installation
- [ ] Node.js installé (v18+)
- [ ] npm installé
- [ ] Dépendances frontend installées (`npm install`)
- [ ] Dépendances backend installées (`cd backend && npm install`)

## 🗄️ BASE DE DONNÉES

### Schémas SQL (dans l'ordre)
- [ ] `schema.sql` exécuté
- [ ] `migration-complete-schema.sql` exécuté
- [ ] `migration-consultations.sql` exécuté
- [ ] `schema-advanced-features-safe.sql` exécuté
- [ ] `rls-policies.sql` exécuté
- [ ] `migration-employee-handling-delete.sql` exécuté (si nécessaire)

### Vérification des tables
- [ ] Table `profiles` existe
- [ ] Table `products` existe
- [ ] Table `orders` existe
- [ ] Table `invoices` existe
- [ ] Table `consultations` existe
- [ ] Table `reviews` existe
- [ ] Table `subscriptions` existe
- [ ] Table `user_behavior_analytics` existe
- [ ] Table `sentiment_analysis` existe
- [ ] Table `metaverse_stores` existe
- [ ] Table `marketplace_sellers` existe
- [ ] Table `iot_devices` existe
- [ ] Table `personalized_formulations` existe
- [ ] Table `beauty_quests` existe

### Vérification des fonctions/triggers
- [ ] Fonction `handle_new_user()` existe
- [ ] Trigger `on_auth_user_created` existe
- [ ] Fonction `is_admin()` existe
- [ ] Fonction `set_updated_at()` existe
- [ ] Fonction `generate_invoice_number()` existe

## 🔐 VARIABLES D'ENVIRONNEMENT

### Backend (`backend/.env`)
- [ ] `SUPABASE_URL` configuré
- [ ] `SUPABASE_ANON_KEY` configuré
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configuré
- [ ] `PORT` configuré (3001 par défaut)

### Frontend (`.env.local`)
- [ ] `NEXT_PUBLIC_API_URL` configuré
- [ ] `BACKEND_URL` configuré

## 🚀 DÉMARRAGE

### Backend
- [ ] Serveur backend démarre sans erreur
- [ ] Port 3001 (ou configuré) disponible
- [ ] Endpoint `/health` répond correctement
- [ ] Logs affichés dans la console

### Frontend
- [ ] Serveur Next.js démarre sans erreur
- [ ] Port 3000 disponible
- [ ] Page d'accueil accessible
- [ ] Pas d'erreurs dans la console du navigateur

## ✅ TESTS FONCTIONNELS

### Authentification
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Déconnexion fonctionne
- [ ] Profil utilisateur créé automatiquement

### Navigation
- [ ] Page d'accueil charge
- [ ] Navigation entre pages fonctionne
- [ ] Liens du header fonctionnent
- [ ] Dashboard accessible après connexion

### Rôles utilisateurs
- [ ] Client peut accéder au dashboard client
- [ ] Employee peut accéder au dashboard employee
- [ ] Admin peut accéder au dashboard admin
- [ ] Protection des routes fonctionne

### Fonctionnalités de base
- [ ] Liste des produits s'affiche
- [ ] Détails produit fonctionnent
- [ ] Chat Luxy s'ouvre
- [ ] Diagnostic beauté fonctionne

## 🔌 INTÉGRATIONS (OPTIONNEL)

### Paiements
- [ ] Stripe configuré (si utilisé)
- [ ] PayPal configuré (si utilisé)
- [ ] Test de paiement effectué

### Email
- [ ] SendGrid/Resend configuré (si utilisé)
- [ ] Test d'envoi d'email effectué

### Stockage
- [ ] Bucket Supabase Storage créé
- [ ] Politiques de stockage configurées
- [ ] Upload de fichiers testé

### IA
- [ ] OpenAI/Anthropic configuré (si utilisé)
- [ ] Test de génération IA effectué

## 🐛 DÉPANNAGE

### Problèmes courants résolus
- [ ] Port 3001 libéré (si occupé)
- [ ] Erreurs de schéma SQL corrigées
- [ ] Variables d'environnement vérifiées
- [ ] Connexion Supabase testée

## 📊 DONNÉES DE TEST

### Créer des données de test
- [ ] Au moins 1 produit créé
- [ ] Au moins 1 utilisateur admin créé
- [ ] Au moins 1 utilisateur employee créé
- [ ] Au moins 1 utilisateur client créé
- [ ] Test de commande effectué
- [ ] Test de consultation effectué

## 🔒 SÉCURITÉ

### Vérifications de sécurité
- [ ] `.env` dans `.gitignore`
- [ ] Clés secrètes non commitées
- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS testées
- [ ] CORS configuré correctement

## 📝 DOCUMENTATION

### Documentation vérifiée
- [ ] README.md à jour
- [ ] GUIDE-DEPLOIEMENT.md lu
- [ ] Commentaires dans le code clairs
- [ ] API endpoints documentés

## 🎯 PRÊT POUR LA PRODUCTION ?

### Avant de déployer en production
- [ ] Variables d'environnement de production configurées
- [ ] Base de données de production créée
- [ ] Schémas SQL exécutés en production
- [ ] Tests de charge effectués
- [ ] Monitoring configuré
- [ ] Backup automatique configuré
- [ ] SSL/HTTPS configuré
- [ ] Domain configuré

---

## 📞 EN CAS DE PROBLÈME

1. Vérifiez les logs du backend
2. Vérifiez la console du navigateur
3. Vérifiez les logs Supabase
4. Consultez GUIDE-DEPLOIEMENT.md section Dépannage

---

**Date de vérification :** _______________

**Vérifié par :** _______________
