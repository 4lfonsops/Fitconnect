# 🎨 Guía de Generación de Iconos - FitConnect PWA

## 📋 Descripción General

Este proyecto incluye un sistema completo de generación de iconos para PWA (Progressive Web App). Los iconos se generan automáticamente desde archivos SVG usando Sharp.

## 🗂️ Archivos de Iconos

### SVG Masters (Fuentes)

| Archivo | Uso | Detalles |
|---------|-----|---------|
| `public/logo.svg` | Logo principal | Versión completa con texto "FitConnect" |
| `public/favicon.svg` | Favicon SVG | Versión simplificada optimizada para pequeños tamaños |

### PNG Generados

| Archivo | Tamaño | Maskable | Uso |
|---------|--------|----------|-----|
| `icon-192x192.png` | 192x192 | No | Launcher, thumbnails |
| `icon-512x512.png` | 512x512 | No | Splash screen, store displays |
| `icon-192x192-maskable.png` | 192x192 | **Sí** | Adaptive icons (Android 8+) |
| `icon-512x512-maskable.png` | 512x512 | **Sí** | Adaptive splash screens |

### ICO Generado

| Archivo | Detalles |
|---------|----------|
| `favicon.ico` | Compatible con browsers antiguos |

## 🚀 Instrucciones de Generación

### 1️⃣ Instalar Sharp

```bash
npm install sharp
```

Sharp es una librería de Node.js para procesar imágenes. Necesita compilación nativa pero se instala automáticamente.

### 2️⃣ Ejecutar el Generador

```bash
node generate-all-icons.js
```

### 3️⃣ Verificar Generación

Deberías ver un output como:

```
🎨 Generador de Iconos - FitConnect PWA

📦 Verificando dependencias...
✅ SVG encontrado

🚀 Generando iconos PNG...

  ✅ icon-192x192.png (192x192)
  ✅ icon-512x512.png (512x512)
  ✅ icon-192x192-maskable.png [maskable]
  ✅ icon-512x512-maskable.png [maskable]

🚀 Generando favicon...

  ✅ favicon.ico

📋 Archivos generados en public/:

  📄 favicon.ico (12.34 KB)
  📄 icon-192x192.png (15.67 KB)
  📄 icon-512x512.png (45.23 KB)
  📄 icon-192x192-maskable.png (16.89 KB)
  📄 icon-512x512-maskable.png (48.12 KB)
```

## 🎯 Configuración en manifest.json

Los iconos ya están configurados en `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-192x192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512x512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## 🜲 Qué es Maskable Icon?

Los **maskable icons** son una característica moderna de Android 8+ que permite que el sistema operativo aplique una máscara personalizada a tu icono.

- **Sin maskable:** Tu icono se ve igual en todos lados
- **Con maskable:** Android puede cortarlo en formas diferentes (círculos, redondeados, etc.)

Los iconos maskable en este proyecto incluyen **20 píxeles de padding** para asegurar que el contenido importante no se corte.

## 🔧 Personalizar Diseño

### Cambiar Colores

Edita `public/logo.svg`:

```svg
<!-- Cambiar color de fondo -->
<rect width="512" height="512" fill="#6366f1" rx="128"/>

<!-- Cambiar colores de los discos del dumbbell -->
<circle cx="160" cy="256" r="45" fill="#22c55e"/> <!-- Verde -->
<circle cx="352" cy="256" r="45" fill="#f97316"/> <!-- Naranja -->
```

### Cambiar el Favicon

Edita `public/favicon.svg` para una versión simplificada si lo necesitas.

Luego regenera:

```bash
node generate-all-icons.js
```

## 🧪 Verificar PWA en DevTools

### Chrome/Edge

1. Abre DevTools (F12)
2. Ve a **Application** → **Manifest**
3. Deberías ver:
   - Manifest válido ✓
   - Métodos de visualización: "standalone" ✓
   - Iconos listados ✓
   - Botón "Add to homescreen" disponible

### Firefox

1. Abre DevTools (F12)
2. Ve a **Manifest**
3. Verifica que todos los iconos sean válidos

## 🎨 Validar Maskable Icons

Usa [maskable.app/editor](https://maskable.app/editor) para ver cómo se ven tus iconos maskable:

1. Sube `icon-512x512-maskable.png`
2. Prueba diferentes formas de máscaras
3. Ajusta el padding si es necesario en `generate-all-icons.js`

## 📱 Instalar PWA

Después de generar los iconos y ejecutar `npm run build`:

```bash
npm run preview
```

Luego:

1. Abre el navegador en `http://localhost:4173`
2. Busca el botón de instalación (ícono + en la barra de direcciones)
3. Click para instalar
4. La app aparecerá en tus aplicaciones

## 🐛 Solucionar Problemas

### Sharp no compila

```bash
# En Windows, asegúrate de tener Build Tools instalados
# O usa la versión precompilada
npm install --no-optional sharp
```

### Los iconos no aparecen en la PWA

1. Limpia el caché:
   ```bash
   # En DevTools → Application → Service Workers → Unregister
   ```

2. Rebuild y preview:
   ```bash
   npm run build
   npm run preview
   ```

3. Abre en navegador incógnito

### El favicon no actualiza

Los navegadores cachean favicon agresivamente. Intenta:

```bash
# Forzar borrado de caché en DevTools
Ctrl+Shift+Delete (Windows/Linux)
Cmd+Shift+Delete (Mac)
```

## 🔄 Automatizar in CI/CD

Si usas GitHub Actions:

```yaml
# .github/workflows/build.yml
- name: Generate PWA Icons
  run: |
    npm install sharp
    node generate-all-icons.js
    
- name: Build
  run: npm run build
```

## 📊 Tamaños de Archivo Esperados

| Archivo | Tamaño Típico |
|---------|-----------------|
| favicon.ico | 8-12 KB |
| icon-192x192.png | 10-15 KB |
| icon-512x512.png | 35-50 KB |
| icon-*-maskable.png | Similar a versión no-maskable |

**Total:** ~100 KB (muy pequeño para download)

## ✨ Script Completo

El script `generate-all-icons.js` incluye:

- ✅ Validación de dependencias
- ✅ Detección automática de archivos SVG
- ✅ Generación de múltiples tamaños
- ✅ Soporte para maskable icons con padding
- ✅ Generación de favicon.ico
- ✅ Logging con emojis 🎨
- ✅ Manejo de errores
- ✅ Guía de próximos pasos

## 🚀 Próximas Ejecuciones

Cuando necesites regenerar:

```bash
# Si cambiaste los SVGs
node generate-all-icons.js

# Si necesitas borrar y regenerar todo
rm public/icon-*.png public/favicon.ico
node generate-all-icons.js

# Rebuild del proyecto
npm run build
npm run preview
```

## 📚 Referencias

- [Web Manifest Spec](https://w3c.github.io/manifest/)
- [Adaptive Icons](https://web.dev/maskable-icon/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)

---

**¡Tu PWA está lista! 🎉**

Ejecuta `node generate-all-icons.js` cuando sea necesario regenerar o actualizar los iconos.
