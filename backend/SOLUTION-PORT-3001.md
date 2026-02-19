# Solution pour l'erreur "Port 3001 déjà utilisé"

## Option 1 : Arrêter le processus existant (Recommandé)

### Méthode A : Utiliser le script PowerShell
```powershell
# Dans PowerShell, exécutez :
.\kill-port-3001.ps1
```

### Méthode B : Commande manuelle
```powershell
# Trouver le processus
netstat -ano | findstr :3001

# Arrêter le processus (remplacez PID par le numéro trouvé)
taskkill /F /PID <PID>

# Ou utiliser cette commande PowerShell :
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

## Option 2 : Changer le port du serveur

### Étape 1 : Modifier le fichier `.env`
Créez ou modifiez le fichier `backend/.env` :

```env
PORT=3002
```

### Étape 2 : Redémarrer le serveur
```bash
npm start
```

Le serveur démarrera sur le port 3002 au lieu de 3001.

## Option 3 : Utiliser une variable d'environnement temporaire

```powershell
# Windows PowerShell
$env:PORT=3002; npm start

# Ou en une ligne
$env:PORT=3002; npm start
```

## Vérification

Après avoir résolu le problème, vérifiez que le serveur démarre correctement :

```bash
npm start
```

Vous devriez voir :
```
IVALUX IMPERIAL API running on http://localhost:3001
```
(ou le port que vous avez choisi)
