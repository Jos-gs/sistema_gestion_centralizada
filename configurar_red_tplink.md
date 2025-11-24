# 📡 Configuración de Red con Router TP-Link y Repetidor WiFi

## 🔧 Configuración del Router TP-Link

### 1. Acceder al Panel de Control
1. Conecta tu laptop al router por cable o WiFi
2. Abre un navegador y ve a: `http://192.168.1.1` o `http://192.168.0.1`
   - Usuario por defecto: `admin`
   - Contraseña por defecto: `admin` (o la que configuraste)
3. Si no conoces la IP del router, ejecuta en PowerShell:
   ```powershell
   ipconfig | findstr "Gateway"
   ```

### 2. Configurar DHCP (Asignación de IPs)
1. Ve a **Network** → **LAN Settings**
2. Asegúrate de que el rango de IPs sea suficiente:
   - Ejemplo: `192.168.1.100` a `192.168.1.200`
   - Esto permite hasta 100 dispositivos

### 3. Habilitar Comunicación entre Dispositivos
1. Ve a **Advanced** → **Firewall** → **Basic Settings**
2. Asegúrate de que el firewall permita comunicación entre dispositivos locales
3. Si hay una opción "AP Isolation" o "Client Isolation", **DESACTÍVALA**

## 📶 Configuración del Repetidor WiFi

### Opción 1: Modo Extensor (Recomendado)
1. Conecta el repetidor cerca del router TP-Link
2. Presiona el botón WPS en el router (si tiene)
3. Presiona el botón WPS en el repetidor
4. Espera a que se conecte (LED parpadea y luego se estabiliza)

### Opción 2: Configuración Manual
1. Conecta el repetidor a una toma de corriente cerca del router
2. Conecta tu laptop al WiFi del repetidor (busca el SSID del repetidor)
3. Abre un navegador y ve a la IP del repetidor (generalmente `192.168.1.1` o `tplinkrepeater.net`)
4. Configura:
   - **Modo**: Extender (Extender Mode)
   - **SSID a extender**: Selecciona el nombre de tu red WiFi principal
   - **Contraseña**: Ingresa la contraseña de tu WiFi principal
5. Guarda la configuración y espera a que se reinicie

### Verificar que el Repetidor Funciona
```powershell
# En tu laptop conectada al repetidor
ipconfig

# Deberías ver una IP similar a las otras computadoras
# Ejemplo: Si el router es 192.168.1.1, tu laptop debería tener 192.168.1.XXX
```

## 🔍 Verificar la Red Completa

### Desde tu Laptop (Servidor):
```powershell
# 1. Ver tu IP
ipconfig

# 2. Ver las IPs de las otras computadoras
# En cada PC-AULA1-XX, ejecuta:
ipconfig | findstr "IPv4"

# 3. Probar conectividad
ping 192.168.1.1  # Router
ping PC-AULA1-01   # Primera PC
ping PC-AULA1-02   # Segunda PC
ping PC-AULA1-03   # Tercera PC
```

### Solución de Problemas Comunes

#### Problema: "No puedo hacer ping a las PC desde la laptop"
**Solución:**
1. Verifica que todas estén en la misma subred:
   - Router: `192.168.1.1`
   - PC-AULA1-01: `192.168.1.101`
   - PC-AULA1-02: `192.168.1.102`
   - PC-AULA1-03: `192.168.1.103`
   - Laptop: `192.168.1.104`
2. Desactiva el firewall temporalmente para probar:
   ```powershell
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
   ```
3. Verifica que el router no tenga "AP Isolation" activado

#### Problema: "La laptop no puede conectarse al repetidor"
**Solución:**
1. Reinicia el repetidor (desconéctalo y vuelve a conectarlo)
2. Olvida la red WiFi en la laptop y vuelve a conectarte
3. Verifica que el repetidor esté en modo "Extender" y no "Router"

#### Problema: "Las PC no se ven entre sí"
**Solución:**
1. Verifica que todas estén conectadas al mismo router
2. Asegúrate de que el firewall de Windows permita comunicación en red privada
3. Ejecuta en cada PC:
   ```powershell
   Set-NetFirewallProfile -Profile Private -Enabled True
   Get-NetFirewallRule -DisplayGroup "Network Discovery" | Enable-NetFirewallRule
   ```

## ✅ Checklist Final

Antes de probar el sistema CIST, verifica:

- [ ] Router TP-Link configurado y funcionando
- [ ] Repetidor WiFi conectado y extendiendo la señal
- [ ] Las 3 PC conectadas al router por cable
- [ ] Laptop conectada al repetidor WiFi
- [ ] Todas las computadoras tienen IPs en la misma subred
- [ ] Puedes hacer ping desde la laptop a las 3 PC
- [ ] Puedes hacer ping desde las PC al router
- [ ] Firewall configurado para permitir comunicación local
- [ ] Nombres de computadora configurados (PC-AULA1-01, 02, 03)

## 🚀 Siguiente Paso

Una vez que todo esté configurado, ejecuta:
```powershell
.\probar_conexiones.ps1
```

Esto verificará que todas las conexiones remotas funcionen correctamente.




