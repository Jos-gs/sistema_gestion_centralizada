# 🔧 Configuración con D-Link DES-1016A (Switch)

## 📡 ¿Qué es el DES-1016A?

El **D-Link DES-1016A** es un **switch de 16 puertos** (switch no administrado). 
**¡Buenas noticias!** No necesita configuración - solo conectas los cables y funciona.

## 🎯 Tu Configuración Actual

```
Router Principal (tu router WiFi/internet)
    ├── D-Link DES-1016A (Switch) ← Conecta las 3 PC aquí
    │   ├── PC-AULA1-01
    │   ├── PC-AULA1-02
    │   └── PC-AULA1-03
    └── Repetidor WiFi
        └── Tu Laptop (por WiFi)
```

## ⚡ Configuración (MUY SIMPLE)

### Paso 1: Conectar Cables
1. **Conecta el switch DES-1016A a tu router principal** por cable Ethernet
   - Usa cualquier puerto del switch
   - Conecta al puerto LAN del router
   
2. **Conecta las 3 PC al switch DES-1016A**
   - Usa cualquier puerto disponible
   - No importa qué puerto uses, todos funcionan igual

3. **Conecta tu laptop al repetidor WiFi** (o directamente al WiFi del router)

### Paso 2: Verificar que Funciona
El switch DES-1016A **NO necesita configuración**. Solo verifica:

```powershell
# En cada PC, verifica que tenga IP
ipconfig

# Todas deben tener IPs en la misma red, ejemplo:
# PC-AULA1-01: 192.168.1.101
# PC-AULA1-02: 192.168.1.102
# PC-AULA1-03: 192.168.1.103
# Tu Laptop: 192.168.1.104
```

### Paso 3: Probar Conectividad
Desde tu laptop:
```powershell
# Probar ping a cada PC
ping PC-AULA1-01
ping PC-AULA1-02
ping PC-AULA1-03

# Si ves respuestas, ¡funciona!
```

## ✅ Ventajas del DES-1016A

- ✅ **No necesita configuración** - Solo conecta y funciona
- ✅ **No hay AP Isolation** - Las PC se comunican directamente
- ✅ **Más puertos** - Tienes 16 puertos disponibles
- ✅ **Más simple** - No hay que configurar nada en el switch

## ⚠️ Si No Funciona

### Problema: "Las PC no tienen IP"
**Solución:**
- Verifica que el switch esté conectado al router principal
- Verifica que el router tenga DHCP habilitado
- Reinicia el switch (desconéctalo y vuelve a conectarlo)

### Problema: "No puedo hacer ping"
**Solución:**
1. Verifica que todas las PC tengan IPs en la misma subred
2. Verifica que el firewall de Windows permita comunicación:
   ```powershell
   # En cada PC, ejecuta como Administrador
   Set-NetFirewallProfile -Profile Private -Enabled True
   Get-NetFirewallRule -DisplayGroup "Network Discovery" | Enable-NetFirewallRule
   ```

### Problema: "El switch no enciende"
**Solución:**
- Verifica que el adaptador de corriente esté conectado
- El switch DES-1016A necesita alimentación externa

## 🔍 Verificar el Switch

El DES-1016A tiene LEDs que indican:
- **LED de alimentación**: Debe estar encendido (verde)
- **LEDs de puertos**: Parpadean cuando hay tráfico de red
- Si un puerto tiene LED encendido = hay conexión
- Si un puerto tiene LED parpadeando = hay tráfico

## 📝 Checklist Rápido

- [ ] Switch DES-1016A conectado al router principal
- [ ] Las 3 PC conectadas al switch
- [ ] Laptop conectada al WiFi (repetidor o router)
- [ ] Todas las PC tienen IPs en la misma red
- [ ] Puedes hacer ping desde la laptop a las 3 PC
- [ ] Nombres de computadora configurados (PC-AULA1-01, 02, 03)

## 🚀 Siguiente Paso

Una vez que todo funcione, ejecuta desde tu laptop:
```powershell
.\probar_conexiones.ps1
```

¡Listo! El switch DES-1016A hace todo automáticamente.




