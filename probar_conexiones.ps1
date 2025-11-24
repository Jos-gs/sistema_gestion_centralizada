# Script para Probar Conexiones desde el Servidor
# Ejecutar como Administrador en el servidor

Write-Host "=== Prueba de Conexiones CIST ===" -ForegroundColor Cyan
Write-Host ""

# Lista de computadoras a probar
$computers = @("PC-AULA1-01", "PC-AULA1-02", "PC-AULA1-03")

$results = @{
    Success = @()
    Failed = @()
}

foreach ($computer in $computers) {
    Write-Host "Probando conexión con $computer..." -ForegroundColor Yellow
    
    # 1. Test de conectividad básica (ping)
    $ping = Test-Connection -ComputerName $computer -Count 2 -Quiet -ErrorAction SilentlyContinue
    
    if ($ping) {
        Write-Host "  ✓ Ping exitoso" -ForegroundColor Green
        
        # 2. Test de WinRM
        try {
            $winrm = Test-WSMan -ComputerName $computer -ErrorAction Stop
            Write-Host "  ✓ WinRM disponible" -ForegroundColor Green
            
            # 3. Test de ejecución remota
            try {
                $result = Invoke-Command -ComputerName $computer -ScriptBlock {
                    return @{
                        ComputerName = $env:COMPUTERNAME
                        OS = (Get-CimInstance Win32_OperatingSystem).Caption
                        User = $env:USERNAME
                    }
                } -ErrorAction Stop
                
                Write-Host "  ✓ Ejecución remota exitosa" -ForegroundColor Green
                Write-Host "    - Nombre: $($result.ComputerName)" -ForegroundColor Gray
                Write-Host "    - OS: $($result.OS)" -ForegroundColor Gray
                Write-Host "    - Usuario: $($result.User)" -ForegroundColor Gray
                
                $results.Success += $computer
            } catch {
                Write-Host "  ✗ Error en ejecución remota: $($_.Exception.Message)" -ForegroundColor Red
                $results.Failed += "$computer (Ejecución remota fallida)"
            }
        } catch {
            Write-Host "  ✗ WinRM no disponible: $($_.Exception.Message)" -ForegroundColor Red
            $results.Failed += "$computer (WinRM no disponible)"
        }
    } else {
        Write-Host "  ✗ No se puede hacer ping a $computer" -ForegroundColor Red
        $results.Failed += "$computer (Sin conectividad)"
    }
    
    Write-Host ""
}

# Resumen
Write-Host "=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "Conexiones exitosas: $($results.Success.Count)" -ForegroundColor Green
if ($results.Success.Count -gt 0) {
    Write-Host "  - $($results.Success -join ', ')" -ForegroundColor Green
}

Write-Host "Conexiones fallidas: $($results.Failed.Count)" -ForegroundColor $(if ($results.Failed.Count -eq 0) { "Green" } else { "Red" })
if ($results.Failed.Count -gt 0) {
    foreach ($failed in $results.Failed) {
        Write-Host "  - $failed" -ForegroundColor Red
    }
}

if ($results.Success.Count -eq $computers.Count) {
    Write-Host "`n✓ Todas las computadoras están listas para usar" -ForegroundColor Green
} else {
    Write-Host "`n⚠ Algunas computadoras necesitan configuración adicional" -ForegroundColor Yellow
}

