# 🚀 GUIDE COMPLET - Déploiement sur Render

Ce guide vous explique comment déployer IVALUX IMPERIAL sur Render (backend + frontend).

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Préparation du projet](#préparation-du-projet)
3. [Déploiement du Backend](#déploiement-du-backend)
4. [Déploiement du Frontend](#déploiement-du-frontend)
5. [Configuration finale](#configuration-finale)
6. [Vérification](#vérification)
7. [Dépannage](#dépannage)

---

## ✅ PRÉREQUIS

Avant de commencer, assurez-vous d'avoir :

- ✅ **Compte Render** (gratuit) - [https://render.com](https://render.com)
- ✅ **Compte Supabase** avec projet configuré
- ✅ **GitHub/GitLab/Bitbucket** compte (pour connecter le repo)
- ✅ **Projet versionné** sur Git (GitHub recommandé)

---

## 🔧 PRÉPARATION DU PROJET

### 1. Vérifier que le projet est sur GitHub

```bash
# Vérifier le statut Git
git status

# Si pas encore sur GitHub, créez un repo et poussez :
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE-USERNAME/ivalux-imperial.git
git push -u origin main
```

### 2. Créer les fichiers de configuration nécessaires

#### A. Backend - Créer `render.yaml` (optionnel mais recommandé)

Créez `render.yaml` à la racine du projet :

```yaml
services:
  - type: web
    name: ivalux-imperial-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false

  - type: web
    name: ivalux-imperial-frontend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        sync: false
      - key: BACKEND_URL
        sync: false
```

#### B. Backend - Créer `.dockerfile` (optionnel)

Si vous préférez Docker, créez `backend/Dockerfile` :

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ .

EXPOSE 10000

CMD ["npm", "start"]
```

#### C. Vérifier les scripts dans `package.json`

**Backend (`backend/package.json`)** doit avoir :
```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

**Frontend (`package.json`)** doit avoir :
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 🖥️ DÉPLOIEMENT DU BACKEND

### Étape 1 : Créer un compte Render

1. Allez sur [https://render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Créez un compte (avec GitHub, GitLab, ou email)

### Étape 2 : Créer un nouveau Web Service (Backend)

1. Dans le dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. **Connectez votre repository GitHub** :
   - Si c'est la première fois, autorisez Render à accéder à votre GitHub
   - Sélectionnez votre repo `ivalux-imperial`

### Étape 3 : Configurer le Backend

Remplissez le formulaire :

**Basic Settings :**
- **Name** : `ivalux-imperial-backend`
- **Region** : Choisissez la région la plus proche (ex: `Frankfurt` pour l'Europe)
- **Branch** : `main` (ou `master`)
- **Root Directory** : `backend` ⚠️ IMPORTANT
- **Runtime** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `npm start`

**Advanced Settings :**
- **Instance Type** : `Free` (pour commencer)
- **Auto-Deploy** : `Yes` (déploie automatiquement à chaque push)

### Étape 4 : Configurer les Variables d'Environnement

Dans la section **"Environment Variables"**, ajoutez :

```
NODE_ENV = production
PORT = 10000
SUPABASE_URL = https://votre-projet.supabase.co
SUPABASE_ANON_KEY = votre_anon_key
SUPABASE_SERVICE_ROLE_KEY = votre_service_role_key
```

**⚠️ IMPORTANT :**
- `PORT` doit être `10000` (port par défaut de Render)
- Utilisez les **vraies clés** de votre projet Supabase
- Ne mettez PAS d'espaces autour du `=`

### Étape 5 : Créer le Service

1. Cliquez sur **"Create Web Service"**
2. Render va commencer à construire et déployer votre backend
3. **Attendez 5-10 minutes** que le build se termine
4. Une fois terminé, vous verrez : **"Your service is live at https://ivalux-imperial-backend.onrender.com"**

**✅ Notez cette URL !** Vous en aurez besoin pour le frontend.

---

## 🌐 DÉPLOIEMENT DU FRONTEND

### Étape 1 : Créer un nouveau Web Service (Frontend)

1. Dans le dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Sélectionnez le **même repository** (`ivalux-imperial`)

### Étape 2 : Configurer le Frontend

**Basic Settings :**
- **Name** : `ivalux-imperial-frontend`
- **Region** : Même région que le backend
- **Branch** : `main` (ou `master`)
- **Root Directory** : `.` (racine du projet)
- **Runtime** : `Node`
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm start`

**Advanced Settings :**
- **Instance Type** : `Free`
- **Auto-Deploy** : `Yes`

### Étape 3 : Configurer les Variables d'Environnement

Dans **"Environment Variables"**, ajoutez :

```
NODE_ENV = production
NEXT_PUBLIC_API_URL = https://ivalux-imperial-backend.onrender.com
BACKEND_URL = https://ivalux-imperial-backend.onrender.com
```

**⚠️ REMPLACEZ** `ivalux-imperial-backend.onrender.com` par **votre vraie URL backend** !

### Étape 4 : Créer le Service

1. Cliquez sur **"Create Web Service"**
2. Attendez 5-10 minutes
3. Votre frontend sera disponible sur : `https://ivalux-imperial-frontend.onrender.com`

---

## ⚙️ CONFIGURATION FINALE

### 1. Mettre à jour `next.config.js` pour la production

Vérifiez que `next.config.js` utilise bien les variables d'environnement :

```javascript
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
```

C'est déjà le cas, donc pas besoin de modifier.

### 2. Configurer CORS dans le backend

Vérifiez que `backend/index.js` autorise les requêtes depuis votre domaine Render :

```javascript
app.use(cors({ 
  origin: [
    'https://ivalux-imperial-frontend.onrender.com',
    'http://localhost:3000' // Pour le développement local
  ],
  credentials: true
}));
```

**Si ce n'est pas le cas**, modifiez `backend/index.js` :

```javascript
// Remplacez cette ligne :
app.use(cors({ origin: true }));

// Par :
const allowedOrigins = [
  'https://ivalux-imperial-frontend.onrender.com',
  process.env.FRONTEND_URL || 'http://localhost:3000'
];

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 3. Ajouter la variable d'environnement FRONTEND_URL

Dans Render, pour le **backend**, ajoutez :

```
FRONTEND_URL = https://ivalux-imperial-frontend.onrender.com
```

---

## ✅ VÉRIFICATION

### 1. Tester le Backend

```bash
# Testez l'endpoint de santé
curl https://ivalux-imperial-backend.onrender.com/health

# Devrait retourner :
# {"status":"ok","service":"ivalux-imperial-api"}
```

### 2. Tester le Frontend

1. Ouvrez : `https://ivalux-imperial-frontend.onrender.com`
2. Vous devriez voir la page d'accueil
3. Testez l'inscription/connexion

### 3. Vérifier les logs

Dans Render Dashboard :
- Cliquez sur votre service
- Allez dans l'onglet **"Logs"**
- Vérifiez qu'il n'y a pas d'erreurs

---

## 🔒 SÉCURITÉ ET CONFIGURATION SUPABASE

### 1. Configurer les URLs autorisées dans Supabase

1. Allez dans Supabase Dashboard → **Authentication** → **URL Configuration**
2. Ajoutez dans **"Redirect URLs"** :
   ```
   https://ivalux-imperial-frontend.onrender.com
   https://ivalux-imperial-frontend.onrender.com/*
   ```
3. Ajoutez dans **"Site URL"** :
   ```
   https://ivalux-imperial-frontend.onrender.com
   ```

### 2. Vérifier les politiques RLS

Assurez-vous que les politiques RLS sont bien configurées dans Supabase pour permettre l'accès depuis Render.

---

## 🐛 DÉPANNAGE

### Erreur : "Build failed"

**Solutions :**
1. Vérifiez les logs dans Render → Logs
2. Vérifiez que `package.json` a les bons scripts
3. Vérifiez que toutes les dépendances sont dans `package.json`
4. Vérifiez que le **Root Directory** est correct (`backend` pour backend, `.` pour frontend)

### Erreur : "Cannot connect to backend"

**Solutions :**
1. Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers la bonne URL backend
2. Vérifiez que le backend est bien démarré (logs Render)
3. Vérifiez CORS dans `backend/index.js`
4. Testez l'URL backend directement : `https://votre-backend.onrender.com/health`

### Erreur : "Port already in use"

**Solution :**
- Render utilise automatiquement le port `10000` ou la variable `PORT`
- Assurez-vous que votre code utilise `process.env.PORT || 3001`

### Erreur : "Module not found"

**Solutions :**
1. Vérifiez que toutes les dépendances sont dans `package.json`
2. Vérifiez que `npm install` s'exécute correctement
3. Vérifiez les logs de build dans Render

### Le site est lent au démarrage

**C'est normal sur le plan gratuit :**
- Render met les services en veille après 15 minutes d'inactivité
- Le premier chargement après veille peut prendre 30-60 secondes
- C'est gratuit, donc c'est normal !

**Solution pour éviter la veille :**
- Utilisez un service de monitoring (ex: UptimeRobot) qui ping votre site toutes les 5 minutes
- Ou passez au plan payant

---

## 📝 CHECKLIST DE DÉPLOIEMENT

- [ ] Compte Render créé
- [ ] Projet sur GitHub/GitLab
- [ ] Backend déployé sur Render
- [ ] Variables d'environnement backend configurées
- [ ] Frontend déployé sur Render
- [ ] Variables d'environnement frontend configurées
- [ ] CORS configuré dans le backend
- [ ] URLs Supabase configurées
- [ ] Backend accessible (`/health` répond)
- [ ] Frontend accessible
- [ ] Authentification fonctionne
- [ ] Logs vérifiés (pas d'erreurs)

---

## 🎯 CONFIGURATION AVANCÉE

### Utiliser un domaine personnalisé

1. Dans Render Dashboard → Votre service → **"Settings"**
2. Allez dans **"Custom Domains"**
3. Ajoutez votre domaine
4. Configurez les DNS selon les instructions Render

### Activer HTTPS automatique

Render fournit HTTPS automatiquement pour tous les services. Pas besoin de configuration supplémentaire.

### Monitoring et logs

- **Logs** : Disponibles dans Render Dashboard → Votre service → Logs
- **Métriques** : Disponibles dans l'onglet Metrics
- **Alertes** : Configurez dans Settings → Notifications

---

## 💰 COÛTS

**Plan Gratuit :**
- ✅ Backend : Gratuit (avec limitations)
- ✅ Frontend : Gratuit (avec limitations)
- ⚠️ Services en veille après 15 min d'inactivité
- ⚠️ Builds limités

**Plan Payant :**
- 💰 À partir de $7/mois par service
- ✅ Pas de veille
- ✅ Plus de ressources
- ✅ Support prioritaire

---

## 🎉 FÉLICITATIONS !

Votre application IVALUX IMPERIAL est maintenant déployée sur Render ! 🚀

**URLs de votre application :**
- Frontend : `https://ivalux-imperial-frontend.onrender.com`
- Backend : `https://ivalux-imperial-backend.onrender.com`

---

## 📞 SUPPORT

- **Documentation Render** : [https://render.com/docs](https://render.com/docs)
- **Support Render** : support@render.com
- **Status Render** : [https://status.render.com](https://status.render.com)

---

**Bon déploiement ! 🚀**
