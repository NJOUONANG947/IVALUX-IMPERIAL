# ⚡ Guide de Démarrage Rapide - IVALUX IMPERIAL

Guide ultra-rapide pour démarrer l'application en 10 minutes.

---

## 🎯 Étapes Rapides

### 1️⃣ Configuration Supabase (2 min)

1. Allez sur [supabase.com](https://supabase.com) → Créez/Connectez-vous
2. Créez un nouveau projet
3. Notez ces 3 valeurs (Project Settings → API) :
   - Project URL
   - anon public key
   - service_role key

---

### 2️⃣ Migrations SQL (5 min)

**Dans Supabase SQL Editor**, exécutez dans cet ordre :

```sql
-- 1. Copiez-collez le contenu de : backend/sql/schema.sql
-- 2. Copiez-collez le contenu de : backend/sql/rls-policies.sql
-- 3. Copiez-collez le contenu de : backend/sql/migration-consultations.sql
-- 4. Copiez-collez le contenu de : backend/sql/migration-complete-schema.sql
-- 5. Copiez-collez le contenu de : backend/sql/rls-policies-complete.sql
-- 6. Copiez-collez le contenu de : backend/sql/migration-products-fields.sql
-- 7. Copiez-collez le contenu de : backend/sql/seed-products.sql
```

**Vérification rapide** :
```sql
SELECT COUNT(*) FROM public.products; -- Devrait retourner 44
```

---

### 3️⃣ Configuration Backend (1 min)

```bash
cd backend
cp .env.example .env
```

Ouvrez `backend/.env` et remplissez :
```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
PORT=3001
```

```bash
npm install
npm start
```

✅ Backend démarré sur `http://localhost:3001`

---

### 4️⃣ Configuration Frontend (1 min)

```bash
# Dans le dossier racine
npm install
npm run dev
```

✅ Frontend démarré sur `http://localhost:3000`

---

### 5️⃣ Créer un Compte Admin (1 min)

1. Allez sur `http://localhost:3000/signup`
2. Créez un compte avec votre email
3. Dans Supabase SQL Editor, exécutez :

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'VOTRE-EMAIL@exemple.com'
);
```

4. Reconnectez-vous → Vous êtes admin ! 🎉

---

## ✅ Vérification

1. **Backend** : `http://localhost:3001/health` → `{"status":"ok"}`
2. **Frontend** : `http://localhost:3000` → Page d'accueil
3. **Admin** : `http://localhost:3000/dashboard/admin` → Dashboard admin
4. **Produits** : `http://localhost:3000/shop` → 44 produits

---

## 🐛 Problèmes Courants

### Backend ne démarre pas
→ Vérifiez que `.env` existe et contient les bonnes clés Supabase

### "Table not found"
→ Vérifiez que toutes les migrations SQL ont été exécutées

### "Permission denied"
→ Vérifiez que `rls-policies-complete.sql` a été exécuté

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **`SETUP_COMPLETE_GUIDE.md`** : Guide complet avec toutes les étapes
- **`backend/sql/MIGRATION_GUIDE.md`** : Guide des migrations SQL
- **`README.md`** : Documentation générale

---

**Temps total** : ~10 minutes  
**Difficulté** : ⭐⭐ (Facile)
