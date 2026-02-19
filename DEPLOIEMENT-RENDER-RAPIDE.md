# ⚡ GUIDE RAPIDE - Déploiement Render en 10 minutes

## 🎯 RÉSUMÉ ULTRA-RAPIDE

### 1. Préparer le projet sur GitHub (2 min)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Créer le compte Render (1 min)

1. Allez sur https://render.com
2. Créez un compte (avec GitHub)
3. Autorisez l'accès à votre repo

### 3. Déployer le Backend (3 min)

1. **New +** → **Web Service**
2. Connectez votre repo GitHub
3. **Configuration :**
   - Name: `ivalux-imperial-backend`
   - Root Directory: `backend` ⚠️
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables :**
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_ANON_KEY=votre_anon_key
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
   ```
5. **Create Web Service**
6. **Attendez** que le build se termine
7. **Notez l'URL** : `https://ivalux-imperial-backend.onrender.com`

### 4. Déployer le Frontend (3 min)

1. **New +** → **Web Service**
2. Même repo GitHub
3. **Configuration :**
   - Name: `ivalux-imperial-frontend`
   - Root Directory: `.` (racine)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Environment Variables :**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://ivalux-imperial-backend.onrender.com
   BACKEND_URL=https://ivalux-imperial-backend.onrender.com
   ```
   ⚠️ Remplacez par votre vraie URL backend !
5. **Create Web Service**
6. **Attendez** que le build se termine

### 5. Configurer Supabase (1 min)

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Ajoutez dans **Redirect URLs** :
   ```
   https://ivalux-imperial-frontend.onrender.com
   https://ivalux-imperial-frontend.onrender.com/*
   ```

### 6. Tester (1 min)

1. Ouvrez : `https://ivalux-imperial-frontend.onrender.com`
2. Testez l'inscription/connexion
3. ✅ Si ça marche → DÉPLOYÉ !

---

## ⚠️ POINTS CRITIQUES

1. **Root Directory** :
   - Backend : `backend` ⚠️
   - Frontend : `.` (point)

2. **Port** :
   - Backend doit utiliser `PORT=10000` ou `process.env.PORT`

3. **URLs** :
   - Remplacez les URLs d'exemple par vos vraies URLs Render

4. **Variables d'environnement** :
   - Ajoutez-les dans Render Dashboard → Environment Variables
   - Ne les mettez PAS dans le code !

---

## 🐛 PROBLÈMES COURANTS

### Build échoue
→ Vérifiez les logs dans Render
→ Vérifiez que Root Directory est correct

### Frontend ne peut pas se connecter au backend
→ Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers la bonne URL
→ Vérifiez que le backend est démarré (logs)

### Erreur CORS
→ Le backend est déjà configuré pour gérer CORS
→ Ajoutez `FRONTEND_URL` dans les variables d'environnement du backend

---

## 📋 CHECKLIST

- [ ] Projet sur GitHub
- [ ] Backend déployé
- [ ] Frontend déployé
- [ ] Variables d'environnement configurées
- [ ] Supabase URLs configurées
- [ ] Test d'inscription fonctionne

---

**Temps total : ~10 minutes**

**Pour plus de détails → Consultez `DEPLOIEMENT-RENDER.md`**
