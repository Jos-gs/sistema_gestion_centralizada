# 🚀 Inicio Rápido - Configuración en 3 Pasos

## Tu Equipo:
- ✅ Switch D-Link DES-1016A
- ✅ Router Principal (tu router WiFi/internet)
- ✅ Repetidor WiFi
- ✅ 3 Computadoras
- ✅ 1 Laptop (servidor)

## ⚡ Configuración Rápida (2 minutos)

### 1️⃣ Conectar Cables
```
Router Principal
    ├── D-Link DES-1016A (Switch) ← NO necesita configuración
    │   ├── PC-AULA1-01
    │   ├── PC-AULA1-02
    │   └── PC-AULA1-03
    └── Repetidor WiFi
        └── Tu Laptop (por WiFi)
```

**¡El switch DES-1016A NO necesita configuración!** Solo conecta los cables.

### 2️⃣ Configurar Nombres de PC
En cada PC, ejecuta como Administrador:
```powershell
.\configurar_computadoras.ps1
```
Ingresa: 1, 2 o 3 → Reinicia

### 3️⃣ Probar
Desde tu laptop:
```powershell
# Verificar IPs
ipconfig

# Probar conexión
ping PC-AULA1-01
ping PC-AULA1-02
ping PC-AULA1-03

# Si funciona, ejecuta:
.\probar_conexiones.ps1
```

## ✅ Listo!

Si todo funciona, ya puedes usar el sistema CIST.

## 📖 Guías Detalladas:
- `configuracion_des_1016a.md` - Configuración del switch DES-1016A
- `GUIA_CONFIGURACION_PRUEBA.md` - Guía paso a paso completa

