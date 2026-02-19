# 🚀 COMMENCEZ MAINTENANT - Actions Immédiates

## ✅ CE QUI EST DÉJÀ FAIT

- ✅ Variables d'environnement backend configurées (`backend/.env`)
- ✅ Port configuré sur 3002
- ✅ Structure du projet prête

## 🎯 CE QU'IL RESTE À FAIRE (dans l'ordre)

### 1️⃣ INSTALLER LES DÉPENDANCES (5 minutes)

**Ouvrez un terminal et exécutez :**

```bash
# À la racine du projet
npm install

# Puis dans le dossier backend
cd backend
npm install
cd ..
```

**Attendez que ça se termine !**

---

### 2️⃣ CONFIGURER LA BASE DE DONNÉES (15 minutes)

**⚠️ C'EST LA PARTIE LA PLUS IMPORTANTE !**

1. **Allez sur** : https://supabase.com
2. **Connectez-vous** ou créez un compte
3. **Créez un projet** (ou utilisez celui existant)
4. **Ouvrez** le SQL Editor dans Supabase
5. **Exécutez ces fichiers DANS L'ORDRE** :

   **a) Schéma de base**
   - Ouvrez : `backend/sql/schema.sql`
   - Copiez TOUT le contenu
   - Collez dans SQL Editor
   - Cliquez "Run"

   **b) Schéma complet**
   - Ouvrez : `backend/sql/migration-complete-schema.sql`
   - Copiez-collez dans SQL Editor
   - Cliquez "Run"

   **c) Consultations**
   - Ouvrez : `backend/sql/migration-consultations.sql`
   - Copiez-collez dans SQL Editor
   - Cliquez "Run"

   **d) Fonctionnalités avancées**
   - Ouvrez : `backend/sql/schema-advanced-features-safe.sql`
   - Copiez-collez dans SQL Editor
   - Cliquez "Run"

   **e) Politiques RLS**
   - Ouvrez : `backend/sql/rls-policies.sql`
   - Copiez-collez dans SQL Editor
   - Cliquez "Run"

6. **Vérifiez** dans Table Editor que les tables existent

---

### 3️⃣ CRÉER LE FICHIER .env.local (1 minute)

**Créez le fichier** `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
BACKEND_URL=http://localhost:3002
```

**⚠️ Note : Port 3002 car votre backend/.env utilise PORT=3002**

---

### 4️⃣ DÉMARRER LE BACKEND (1 minute)

**Ouvrez un terminal :**

```bash
cd backend
npm start
```

**Vous devriez voir :**
```
IVALUX IMPERIAL API running on http://localhost:3002
```

**✅ Si vous voyez ça → Backend OK !**

**⚠️ LAISSEZ CE TERMINAL OUVERT !**

---

### 5️⃣ DÉMARRER LE FRONTEND (1 minute)

**Ouvrez un NOUVEAU terminal :**

```bash
# À la racine du projet
npm run dev
```

**Vous devriez voir :**
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

**✅ Si vous voyez ça → Frontend OK !**

---

### 6️⃣ TESTER (2 minutes)

1. **Ouvrez** : http://localhost:3000
2. **Cliquez sur** "Sign Up"
3. **Créez un compte** :
   - Email : `test@example.com`
   - Password : `test123456`
   - Nom : `Test User`
4. **Connectez-vous**

**✅ Si vous arrivez sur le dashboard → TOUT FONCTIONNE ! 🎉**

---

## 📋 RÉCAPITULATIF RAPIDE

```bash
# 1. Installer
npm install
cd backend && npm install && cd ..

# 2. Créer .env.local (à la racine)
# Contenu : NEXT_PUBLIC_API_URL=http://localhost:3002
#          BACKEND_URL=http://localhost:3002

# 3. Configurer Supabase (SQL Editor)
# Exécuter dans l'ordre : schema.sql, migration-complete-schema.sql,
# migration-consultations.sql, schema-advanced-features-safe.sql, rls-policies.sql

# 4. Démarrer backend (Terminal 1)
cd backend
npm start

# 5. Démarrer frontend (Terminal 2)
npm run dev

# 6. Tester
# Ouvrir http://localhost:3000
```

---

## ⚠️ PROBLÈMES COURANTS

### Port 3002 occupé ?
```powershell
Get-NetTCPConnection -LocalPort 3002 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Erreur "Table does not exist" ?
→ Vérifiez que vous avez exécuté TOUS les schémas SQL dans l'ordre

### Erreur "Cannot connect" ?
→ Vérifiez que le backend est démarré (Terminal 1)
→ Vérifiez que le port est correct (3002)

---

## 🎯 TEMPS TOTAL : ~25 minutes

**Commencez maintenant ! Suivez les étapes dans l'ordre.**

---

**Besoin d'aide détaillée ?** → Lisez `ACTION-IMMEDIATE.md`
