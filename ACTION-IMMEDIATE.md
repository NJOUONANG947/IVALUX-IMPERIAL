# 🎯 ACTIONS IMMÉDIATES - Rendre l'Application Fonctionnelle

## ⚡ GUIDE RAPIDE - Suivez ces étapes dans l'ordre

---

## ÉTAPE 1 : Vérifier les prérequis (2 minutes)

### Vérifier Node.js
```bash
node --version
# Doit afficher v18 ou supérieur
```

### Vérifier npm
```bash
npm --version
```

**Si Node.js n'est pas installé :**
- Téléchargez depuis : https://nodejs.org/
- Installez la version LTS

---

## ÉTAPE 2 : Installer les dépendances (3 minutes)

### Frontend
```bash
# Ouvrez un terminal à la racine du projet
npm install
```

### Backend
```bash
# Dans le même terminal ou un nouveau
cd backend
npm install
cd ..
```

**Attendez que l'installation se termine !**

---

## ÉTAPE 3 : Créer un compte Supabase (5 minutes)

1. **Allez sur** : https://supabase.com
2. **Cliquez sur** "Start your project" ou "Sign Up"
3. **Créez un compte** (gratuit)
4. **Créez un nouveau projet** :
   - Nom du projet : `ivalux-imperial` (ou autre)
   - Mot de passe : notez-le quelque part
   - Région : choisissez la plus proche
   - Cliquez sur "Create new project"
5. **Attendez 2-3 minutes** que le projet soit créé

---

## ÉTAPE 4 : Récupérer les clés Supabase (2 minutes)

1. Dans le dashboard Supabase, allez dans **Settings** (icône ⚙️ en bas à gauche)
2. Cliquez sur **API**
3. **Copiez ces 3 valeurs** :

   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** key : `eyJhbGc...` (longue chaîne)
   - **service_role** key : `eyJhbGc...` (longue chaîne) ⚠️ SECRÈTE

4. **Gardez cette page ouverte** pour la prochaine étape

---

## ÉTAPE 5 : Configurer les variables d'environnement (3 minutes)

### A. Backend

1. **Ouvrez le fichier** : `backend/.env`
2. **Remplacez les valeurs** par celles de votre projet Supabase :

```env
SUPABASE_URL=https://VOTRE-PROJET.supabase.co
SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

PORT=3001
```

3. **Sauvegardez** le fichier

### B. Frontend

1. **Créez le fichier** : `.env.local` à la racine du projet
2. **Ajoutez** :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
```

3. **Sauvegardez** le fichier

---

## ÉTAPE 6 : Configurer la base de données (15 minutes)

### ⚠️ IMPORTANT : Exécutez dans cet ordre exact !

1. **Ouvrez Supabase Dashboard**
2. **Cliquez sur** "SQL Editor" dans le menu de gauche
3. **Cliquez sur** "New Query"

### 6.1 - Schéma de base

1. **Ouvrez le fichier** : `backend/sql/schema.sql`
2. **Copiez TOUT le contenu**
3. **Collez dans** le SQL Editor de Supabase
4. **Cliquez sur** "Run" (ou F5)
5. **Vérifiez** qu'il n'y a pas d'erreur (message vert "Success")

### 6.2 - Schéma complet

1. **Ouvrez** : `backend/sql/migration-complete-schema.sql`
2. **Copiez TOUT le contenu**
3. **Collez dans** un nouveau query dans SQL Editor
4. **Cliquez sur** "Run"
5. **Vérifiez** le succès

### 6.3 - Consultations

1. **Ouvrez** : `backend/sql/migration-consultations.sql`
2. **Copiez-collez** dans SQL Editor
3. **Cliquez sur** "Run"

### 6.4 - Fonctionnalités avancées (VERSION SAFE)

1. **Ouvrez** : `backend/sql/schema-advanced-features-safe.sql`
2. **Copiez-collez** dans SQL Editor
3. **Cliquez sur** "Run"
4. **Attendez** que ça se termine (peut prendre 30 secondes)

### 6.5 - Politiques RLS

1. **Ouvrez** : `backend/sql/rls-policies.sql`
2. **Copiez-collez** dans SQL Editor
3. **Cliquez sur** "Run"

### 6.6 - Vérification

1. Dans Supabase Dashboard, cliquez sur **Table Editor**
2. **Vérifiez** que vous voyez ces tables :
   - ✅ profiles
   - ✅ products
   - ✅ orders
   - ✅ invoices
   - ✅ consultations
   - ✅ reviews
   - ✅ Et beaucoup d'autres...

**Si toutes les tables sont là → ✅ Base de données prête !**

---

## ÉTAPE 7 : Libérer le port 3001 (si nécessaire)

### Vérifier si le port est libre

```bash
# Windows PowerShell
netstat -ano | findstr :3001
```

**Si vous voyez une ligne** → Le port est occupé

### Libérer le port

**Option A : Utiliser le script**
```powershell
cd backend
.\kill-port-3001.ps1
```

**Option B : Commande manuelle**
```powershell
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**Option C : Changer le port**
- Modifiez `backend/.env` : `PORT=3002`
- Modifiez `.env.local` : `BACKEND_URL=http://localhost:3002`

---

## ÉTAPE 8 : Démarrer le backend (1 minute)

### Ouvrez un terminal

```bash
cd backend
npm start
```

**Vous devriez voir :**
```
IVALUX IMPERIAL API running on http://localhost:3001
```

**✅ Si vous voyez ce message → Backend démarré !**

**❌ Si erreur :**
- Vérifiez que le port est libre (étape 7)
- Vérifiez que `backend/.env` est correct
- Vérifiez que `npm install` a fonctionné

**⚠️ LAISSEZ CE TERMINAL OUVERT !**

---

## ÉTAPE 9 : Démarrer le frontend (1 minute)

### Ouvrez un NOUVEAU terminal

```bash
# À la racine du projet (pas dans backend/)
npm run dev
```

**Vous devriez voir :**
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

**✅ Si vous voyez ce message → Frontend démarré !**

**⚠️ LAISSEZ CE TERMINAL OUVERT AUSSI !**

---

## ÉTAPE 10 : Tester l'application (5 minutes)

### 10.1 - Ouvrir l'application

1. **Ouvrez votre navigateur**
2. **Allez sur** : http://localhost:3000
3. **Vous devriez voir** la page d'accueil IVALUX IMPERIAL

### 10.2 - Tester l'inscription

1. **Cliquez sur** "Sign Up" ou "S'inscrire"
2. **Remplissez le formulaire** :
   - Email : `test@example.com`
   - Password : `test123456`
   - Nom complet : `Test User`
3. **Cliquez sur** "Sign Up"
4. **Vous devriez être** redirigé vers le dashboard

**✅ Si ça fonctionne → Authentification OK !**

### 10.3 - Vérifier dans Supabase

1. **Allez dans** Supabase Dashboard → **Authentication** → **Users**
2. **Vous devriez voir** votre utilisateur créé
3. **Allez dans** **Table Editor** → **profiles**
4. **Vous devriez voir** votre profil avec `role: client`

**✅ Si c'est le cas → Base de données fonctionne !**

### 10.4 - Tester le backend API

1. **Ouvrez** : http://localhost:3001/health
2. **Vous devriez voir** : `{"status":"ok","service":"ivalux-imperial-api"}`

**✅ Si c'est le cas → API fonctionne !**

---

## ✅ RÉSULTAT ATTENDU

Après toutes ces étapes, vous devriez avoir :

- ✅ Application accessible sur http://localhost:3000
- ✅ Backend API fonctionnel sur http://localhost:3001
- ✅ Base de données configurée dans Supabase
- ✅ Authentification fonctionnelle
- ✅ Possibilité de créer des comptes
- ✅ Dashboards accessibles selon les rôles

---

## 🐛 EN CAS DE PROBLÈME

### Erreur "Port already in use"
→ Voir ÉTAPE 7

### Erreur "Cannot connect to Supabase"
→ Vérifiez `backend/.env` (les clés sont correctes ?)

### Erreur "Table does not exist"
→ Vérifiez ÉTAPE 6 (tous les schémas SQL exécutés ?)

### Erreur "Module not found"
→ Relancez `npm install` dans le dossier concerné

### Page blanche dans le navigateur
→ Ouvrez la Console (F12) et regardez les erreurs
→ Vérifiez que le backend est démarré

---

## 📞 BESOIN D'AIDE ?

1. **Vérifiez les logs** dans les terminaux
2. **Vérifiez la console** du navigateur (F12)
3. **Vérifiez les logs** Supabase Dashboard → Logs
4. **Consultez** `GUIDE-DEPLOIEMENT.md` pour plus de détails

---

## 🎉 FÉLICITATIONS !

Si tout fonctionne, votre application est **OPÉRATIONNELLE** ! 🚀

Vous pouvez maintenant :
- Créer des produits (dashboard admin)
- Gérer des utilisateurs
- Créer des commandes
- Utiliser toutes les fonctionnalités

---

**Temps total estimé : 30-45 minutes**

**Commencez par l'ÉTAPE 1 et suivez dans l'ordre !**
