# Script de Configuración para Computadoras de Prueba
# Ejecutar como Administrador en cada computadora

Write-Host "=== Configuración de Computadora para CIST ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar número de computadora
$pcNumber = Read-Host "Ingresa el número de esta computadora (1, 2 o 3)"

if ($pcNumber -notmatch '^[1-3]$') {
    Write-Host "Error: Debe ingresar un número entre 1 y 3" -ForegroundColor Red
    exit 1
}

$computerName = "PC-AULA1-0$pcNumber"

Write-Host "Configurando computadora como: $computerName" -ForegroundColor Yellow

# 1. Renombrar computadora
Write-Host "`n[1/4] Renombrando computadora..." -ForegroundColor Cyan
try {
    Rename-Computer -NewName $computerName -Force -ErrorAction Stop
    Write-Host "✓ Computadora renombrada correctamente" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al renombrar: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Nota: Puede que necesites reiniciar primero" -ForegroundColor Yellow
}

# 2. Habilitar PowerShell Remoting
Write-Host "`n[2/4] Habilitando PowerShell Remoting..." -ForegroundColor Cyan
try {
    Enable-PSRemoting -Force -ErrorAction Stop
    Write-Host "✓ PowerShell Remoting habilitado" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al habilitar PSRemoting: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Configurar Firewall
Write-Host "`n[3/4] Configurando Firewall..." -ForegroundColor Cyan
try {
    Set-NetFirewallRule -DisplayName "Windows Remote Management (HTTP-In)" -Enabled True -ErrorAction SilentlyContinue
    Set-NetFirewallRule -DisplayName "Windows Remote Management (HTTP-In)" -Profile Any -ErrorAction SilentlyContinue
    Write-Host "✓ Firewall configurado" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al configurar firewall: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Configurar TrustedHosts
Write-Host "`n[4/4] Configurando TrustedHosts..." -ForegroundColor Cyan
try {
    $currentTrusted = (Get-Item WSMan:\localhost\Client\TrustedHosts).Value
    if ($currentTrusted -ne "*" -and $currentTrusted -notlike "*$computerName*") {
        if ($currentTrusted) {
            Set-Item WSMan:\localhost\Client\TrustedHosts -Value "$currentTrusted,$computerName" -Force
        } else {
            Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force
        }
        Write-Host "✓ TrustedHosts configurado" -ForegroundColor Green
    } else {
        Write-Host "✓ TrustedHosts ya está configurado" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Error al configurar TrustedHosts: $($_.Exception.Message)" -ForegroundColor Red
}

# Verificar servicios
Write-Host "`nVerificando servicios..." -ForegroundColor Cyan
$winrm = Get-Service WinRM
if ($winrm.Status -eq 'Running') {
    Write-Host "✓ Servicio WinRM está ejecutándose" -ForegroundColor Green
} else {
    Write-Host "✗ Servicio WinRM no está ejecutándose. Iniciando..." -ForegroundColor Yellow
    Start-Service WinRM
}

Write-Host "`n=== Configuración Completada ===" -ForegroundColor Green
Write-Host "Nombre de computadora: $computerName" -ForegroundColor Yellow
Write-Host "`nIMPORTANTE: Debes reiniciar la computadora para que los cambios surtan efecto." -ForegroundColor Yellow
Write-Host "¿Deseas reiniciar ahora? (S/N)" -ForegroundColor Cyan
$restart = Read-Host
if ($restart -eq 'S' -or $restart -eq 's') {
    Restart-Computer -Force
}

