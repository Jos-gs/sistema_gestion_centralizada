# 🔧 Configuración Simple - TP-Link Archer C20 + D-Link

## 📡 Paso 1: Conectar Todo (2 Opciones)

### Opción A: Con D-Link como Switch (RECOMENDADO - Más Simple)
1. **Conecta el D-Link al router Archer C20 por cable Ethernet**
2. **Conecta las 3 PC al D-Link** (en lugar de al router)
3. **Conecta tu laptop al repetidor WiFi** (o al WiFi del Archer C20)

### Opción B: Sin D-Link
1. **Conecta las 3 PC directamente al router Archer C20 por cable Ethernet**
   - Usa los puertos LAN del router (amarillos)
2. **Conecta tu laptop al repetidor WiFi**
   - El repetidor extiende la señal del Archer C20

## 🌐 Paso 2: Configurar el Router Archer C20

### Acceder al Router:
1. Conecta tu laptop al WiFi del router (o por cable)
2. Abre el navegador y ve a: `http://192.168.0.1` o `http://192.168.1.1`
3. Usuario: `admin` / Contraseña: `admin` (o la que configuraste)

### Configuración Rápida:

1. **Verificar DHCP (Asignación de IPs)**
   - Ve a **Advanced** → **Network** → **DHCP Server**
   - Asegúrate de que esté **Habilitado**
   - Rango de IP: Deja el predeterminado (ej: 192.168.0.100 - 192.168.0.199)

2. **Desactivar AP Isolation (MUY IMPORTANTE)**
   - Ve a **Advanced** → **Wireless** → **Wireless Advanced**
   - Busca **"AP Isolation"** o **"Client Isolation"**
   - **DESACTÍVALO** (debe estar en OFF/Disabled)
   - Esto permite que los dispositivos se comuniquen entre sí

3. **Guardar Configuración**
   - Haz clic en **Save** o **Guardar**

## 📶 Paso 3: Configurar el Repetidor WiFi

### Opción Simple (WPS):
1. Presiona el botón **WPS** en el router Archer C20 (mantén presionado 2 segundos)
2. Presiona el botón **WPS** en el repetidor
3. Espera a que se conecte (LED se estabiliza)

### Si no tiene WPS:
1. Conecta el repetidor cerca del router
2. Conecta tu laptop al WiFi del repetidor
3. Abre el navegador y ve a la IP del repetidor (generalmente `192.168.0.1` o busca en el manual)
4. Configura:
   - **Modo**: Extender (Extender Mode)
   - **Red a extender**: Selecciona el nombre de tu WiFi del Archer C20
   - **Contraseña**: La contraseña de tu WiFi del Archer C20

## ✅ Paso 4: Verificar que Todo Funciona

### En tu Laptop:
```powershell
# Ver tu IP
ipconfig

# Deberías ver algo como: 192.168.0.XXX
```

### En cada PC (PC-AULA1-01, 02, 03):
```powershell
# Ver su IP
ipconfig

# Todas deben tener IPs similares, ejemplo:
# PC-AULA1-01: 192.168.0.101
# PC-AULA1-02: 192.168.0.102
# PC-AULA1-03: 192.168.0.103
# Tu Laptop: 192.168.0.104
```

### Probar Conectividad:
```powershell
# Desde tu laptop, prueba ping a cada PC
ping PC-AULA1-01
ping PC-AULA1-02
ping PC-AULA1-03

# Si funciona, verás respuestas como:
# Respuesta desde 192.168.0.101: bytes=32 tiempo<1ms TTL=64
```

## 🔧 Si Tienes un D-Link También (Más Sencillo)

**¡Excelente! Un D-Link puede hacer esto más fácil:**

### Opción 1: D-Link como Switch (MÁS SIMPLE)
Si tienes un D-Link que puede funcionar como switch:
1. **Conecta el D-Link al Archer C20 por cable Ethernet**
2. **Conecta las 3 PC al D-Link** (en lugar de al router directamente)
3. **Configura el D-Link en modo "Switch" o "Bridge"** (no Router)
   - Esto hace que el D-Link solo pase el tráfico, sin crear otra red
4. **Conecta tu laptop al repetidor WiFi** (o directamente al Archer C20)

**Ventaja:** Todo queda en la misma red, más fácil de configurar.

### Opción 2: D-Link como Repetidor WiFi
Si el D-Link es un repetidor WiFi:
- Configura igual que el repetidor anterior
- Asegúrate de que esté en modo "Extender" o "Access Point"
- Conecta tu laptop al D-Link en lugar del otro repetidor

### Configuración del D-Link como Switch:
1. Conecta el D-Link al Archer C20 por cable
2. Accede a la configuración del D-Link (generalmente `192.168.0.1` o `dlinkrouter.local`)
3. Ve a **Network Settings** → **LAN Settings**
4. **Desactiva DHCP** (el Archer C20 ya lo maneja)
5. Cambia el modo a **"Switch"** o **"Bridge"**
6. Guarda y reinicia

## ⚠️ Solución Rápida de Problemas

### "No puedo hacer ping a las PC"
1. Verifica que AP Isolation esté DESACTIVADO en el Archer C20
2. Verifica que todas las IPs estén en la misma subred (192.168.0.XXX)
3. Desactiva temporalmente el firewall de Windows para probar:
   ```powershell
   Set-NetFirewallProfile -Profile Private -Enabled False
   ```

### "La laptop no se conecta al repetidor"
1. Reinicia el repetidor
2. Olvida la red WiFi en la laptop y vuelve a conectarte
3. Verifica que el repetidor esté cerca del router

### "No encuentro AP Isolation en el router"
- En algunos modelos está en: **Advanced** → **Wireless** → **Wireless Settings**
- O busca en: **Advanced** → **System Tools** → **System Parameters**

## ✅ Checklist Rápido

- [ ] 3 PC conectadas al Archer C20 por cable
- [ ] Laptop conectada al repetidor WiFi
- [ ] AP Isolation DESACTIVADO en el router
- [ ] Todas las computadoras tienen IPs en la misma subred
- [ ] Puedes hacer ping desde la laptop a las 3 PC
- [ ] Nombres de computadora configurados (PC-AULA1-01, 02, 03)

## 🚀 Siguiente Paso

Una vez que todo funcione, ejecuta desde tu laptop:
```powershell
.\probar_conexiones.ps1
```

¡Listo! Ahora puedes probar el sistema CIST.

