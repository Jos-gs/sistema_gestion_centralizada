# 🔧 Guía de Configuración para Prueba del Sistema

## 📋 Requisitos Previos

- 3 computadoras con Windows
- 1 Laptop (servidor) con Windows
- 1 Switch D-Link DES-1016A
- 1 Router Principal (tu router WiFi/internet)
- 1 Repetidor WiFi (extensor)
- Todas las computadoras en la misma red

## 🌐 Paso 0: Configurar la Red (MUY SIMPLE)

**📖 Para configuración detallada del switch DES-1016A, ve a: `configuracion_des_1016a.md`**

### Resumen Rápido:
1. **Conecta el switch DES-1016A a tu router principal** por cable Ethernet
2. **Conecta las 3 PC al switch DES-1016A** (cualquier puerto)
3. **Conecta tu laptop al repetidor WiFi**
4. **¡Listo!** El switch NO necesita configuración - solo conecta y funciona
5. **Verifica que todas estén en la misma red:**
   ```powershell
   # En cada computadora
   ipconfig
   # Todas deben tener IPs en la misma subred (ej: 192.168.1.XXX)
   
   # Desde tu laptop, prueba:
   ping PC-AULA1-01
   ping PC-AULA1-02
   ping PC-AULA1-03
   ```

## 🖥️ Paso 1: Configurar los Nombres de las Computadoras

En cada una de las 3 computadoras, configura el nombre de equipo:

### Computadora 1:
```powershell
# Ejecutar como Administrador en PowerShell
Rename-Computer -NewName "PC-AULA1-01" -Restart
```

### Computadora 2:
```powershell
Rename-Computer -NewName "PC-AULA1-02" -Restart
```

### Computadora 3:
```powershell
Rename-Computer -NewName "PC-AULA1-03" -Restart
```

**Alternativa manual:**
1. Presiona `Win + R`, escribe `sysdm.cpl` y presiona Enter
2. Ve a la pestaña "Nombre del equipo"
3. Haz clic en "Cambiar"
4. Ingresa el nombre correspondiente (PC-AULA1-01, PC-AULA1-02, etc.)
5. Reinicia la computadora

## 🔐 Paso 2: Configurar Permisos de Red

En cada computadora, ejecuta estos comandos como Administrador:

```powershell
# Habilitar PowerShell Remoting
Enable-PSRemoting -Force

# Configurar firewall para permitir conexiones remotas
Set-NetFirewallRule -DisplayName "Windows Remote Management (HTTP-In)" -Enabled True

# Permitir conexiones remotas desde cualquier computadora (para prueba)
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force
```

## 🌐 Paso 3: Verificar la Red

Desde tu laptop (servidor), verifica la conectividad:

```powershell
# Probar conexión a cada computadora
Test-Connection -ComputerName "PC-AULA1-01" -Count 2
Test-Connection -ComputerName "PC-AULA1-02" -Count 2
Test-Connection -ComputerName "PC-AULA1-03" -Count 2
```

**Nota importante para WiFi:**
- Si tu laptop está conectada por WiFi y las otras PC por cable, asegúrate de que:
  - El repetidor WiFi esté en modo "Extensor" o "Access Point"
  - Todas las computadoras estén en la misma subred
  - El firewall del router permita comunicación entre dispositivos

## 🔑 Paso 4: Configurar Credenciales

El sistema necesita credenciales administrativas para conectarse a las computadoras remotas.

**Opción 1: Usar la misma cuenta de administrador en todas las PC**
- Crea un usuario administrador con la misma contraseña en todas las computadoras
- Ejemplo: Usuario: `admin`, Contraseña: `Admin123`

**Opción 2: Configurar WinRM con credenciales**
```powershell
# En cada computadora remota
$credential = Get-Credential
Enable-PSRemoting -Force
```

## 🧪 Paso 5: Probar la Conexión Remota

Desde el servidor, prueba la conexión remota:

```powershell
# Probar conexión remota
Invoke-Command -ComputerName "PC-AULA1-01" -ScriptBlock { 
    Write-Host "Conexión exitosa desde $env:COMPUTERNAME"
    Get-ComputerInfo | Select-Object WindowsProductName
} -Credential (Get-Credential)
```

## 📝 Paso 6: Configurar el Sistema CIST

El sistema ya está configurado para usar estas 3 computadoras en "Aula 1". 

Para probar:
1. Inicia sesión como administrador (Ingeniero)
2. Ve a la sección "IA - Instalaciones"
3. Crea una solicitud de instalación
4. Genera el script PowerShell
5. Ejecuta el script (solo administradores pueden ejecutar)

## ⚠️ Notas Importantes

1. **Firewall**: Asegúrate de que el firewall de Windows permita conexiones remotas
2. **Antivirus**: Algunos antivirus pueden bloquear conexiones remotas
3. **Red**: Todas las computadoras deben estar en la misma red local
4. **Permisos**: El usuario que ejecuta el script debe tener permisos de administrador
5. **WinRM**: PowerShell Remoting debe estar habilitado en todas las computadoras

## 🔍 Solución de Problemas

### Error: "No se puede conectar con PC-AULA1-XX"
- Verifica que el nombre de la computadora sea correcto: `hostname`
- Verifica la conectividad de red: `ping PC-AULA1-01`
- Verifica que WinRM esté habilitado: `Get-Service WinRM`

### Error: "Acceso denegado"
- Verifica las credenciales
- Asegúrate de que el usuario tenga permisos de administrador
- Verifica la configuración de TrustedHosts

### Error: "No se puede establecer conexión"
- Verifica el firewall
- Verifica que todas las PC estén en la misma red
- Verifica que el servicio WinRM esté ejecutándose

## 📞 Próximos Pasos

Una vez configurado, puedes:
1. Probar la distribución de documentos
2. Probar las solicitudes de instalación
3. Verificar los registros en el panel de administración

