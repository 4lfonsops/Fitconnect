# 🚀 Quick Start - Generación de Iconos PWA

## ⏱️ Tiempo Requerido: 3 minutos

### Paso 1: Instalar Sharp

```bash
npm install sharp
```

**¿Qué hace?** Descarga la librería para procesar imágenes.

### Paso 2: Generar Iconos

```bash
node generate-all-icons.js
```

**¿Qué hace?** Crea automáticamente:
- 4 archivos PNG de diferentes tamaños
- 1 archivo favicon.ico
- Configura todo automáticamente

### Paso 3: Verificar Generación

Deberías ver en `public/`:
- ✅ favicon.ico
- ✅ icon-192x192.png  
- ✅ icon-512x512.png
- ✅ icon-192x192-maskable.png
- ✅ icon-512x512-maskable.png

### Paso 4: Build y Prueba

```bash
npm run build
npm run preview
```

Abre tu navegador en `http://localhost:4173` y verifica:
- El favicon aparece en la pestaña ✓
- El icono de instalación está en la barra de direcciones ✓

## 🎯 ¿Qué Está Listo?

✅ **Logos SVG** - Master logo + favicon (listos)
✅ **Script de Generación** - `generate-all-icons.js` (listo)
✅ **Configuración PWA** - manifest.json, service worker, index.html (configurado)
✅ **Componentes** - UpdatePrompt, ServiceWorkerManager (implementado)

## 📋 Archivos Creados Hoy

1. **generate-all-icons.js** - Script completo de generación
2. **public/logo.svg** - Logo principal con texto
3. **public/favicon.svg** - Favicon simplificado
4. **index.html** - Actualizado con referencias a favicon.svg
5. **ICON_GENERATION_GUIDE.md** - Documentación detallada

## 💡 Personalizaciones

### Cambiar Colores

Edita el color en `public/logo.svg` (actualmente #6366f1 - púrpura):

```xml
<rect width="512" height="512" fill="#6366f1" rx="128"/>
```

Luego regenera:

```bash
node generate-all-icons.js
```

### Ver Cómo Se Ven Maskable

Usa: https://maskable.app/editor

Sube `icon-512x512-maskable.png` y prueba diferentes máscaras.

## ❓ Problemas?

### "Sharp no se instala"
- Windows: Instala Build Tools
- Alternativa: `npm install --build-from-source sharp`

### "Los iconos no aparecen"
- Abre DevTools en la pestaña del preview
- Ve a Application → Cache Storage
- Borra todo
- Recarga la página

### "No veo botón de instalar"
- Asegúrate que usas **https** en producción
- O usa `npm run preview` en local (ya funciona)

## 🎉 ¡Listo!

```bash
# Una sola vez:
npm install sharp
node generate-all-icons.js

# Luego prueba:
npm run build
npm run preview
```

**¿Necesitas ayuda?** Lee `ICON_GENERATION_GUIDE.md` para detalles completos.
