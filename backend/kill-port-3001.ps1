# Script pour arrêter le processus utilisant le port 3001
Write-Host "Recherche du processus utilisant le port 3001..." -ForegroundColor Yellow

$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Processus trouvé avec PID: $process" -ForegroundColor Cyan
    $processInfo = Get-Process -Id $process -ErrorAction SilentlyContinue
    if ($processInfo) {
        Write-Host "Nom du processus: $($processInfo.ProcessName)" -ForegroundColor Cyan
        Write-Host "Chemin: $($processInfo.Path)" -ForegroundColor Cyan
        
        Write-Host "`nArrêt du processus..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        
        Start-Sleep -Seconds 1
        
        # Vérifier si le processus est toujours actif
        $stillRunning = Get-Process -Id $process -ErrorAction SilentlyContinue
        if ($stillRunning) {
            Write-Host "ERREUR: Le processus est toujours actif. Essayez d'exécuter en tant qu'administrateur." -ForegroundColor Red
        } else {
            Write-Host "SUCCÈS: Le processus a été arrêté." -ForegroundColor Green
            Write-Host "Vous pouvez maintenant démarrer le serveur avec: npm start" -ForegroundColor Green
        }
    } else {
        Write-Host "Le processus n'existe plus." -ForegroundColor Green
    }
} else {
    Write-Host "Aucun processus trouvé sur le port 3001." -ForegroundColor Green
}
