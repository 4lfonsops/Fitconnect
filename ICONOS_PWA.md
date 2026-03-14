# Setup de Iconos para PWA

Para completar la configuración PWA de FitConnect, necesitas agregar los siguientes iconos en la carpeta `public/`:

## Iconos requeridos

### 1. **Favicon** (icono de navegador)
- `public/favicon.ico` (64x64 px)
- Usado en pestañas del navegador

### 2. **Apple Touch Icon** (iOS)
- `public/icon-192x192.png` (192x192 px)
- Mostrado en pantalla de inicio de iOS

### 3. **PWA Icons** (instalación en home screen)

#### Versión regular:
- `public/icon-192x192.png` (192x192 px) - Usado por Android/Web
- `public/icon-512x512.png` (512x512 px) - Usado por stores

#### Versión "maskable" (iOS 15.4+):
- `public/icon-192x192-maskable.png` (192x192 px)
- `public/icon-512x512-maskable.png` (512x512 px)

## Guidelines para crear los iconos

### Requisitos técnicos:
```
PNG Format (RGBA, con transparencia)
- 192x192: Para Android y web
- 512x512: Para splash screens
- Maskable: Mismo contenido, con margen de seguridad
```

### Requisitos de diseño:

**Icons regulares:**
- Logo centrado
- Fondo sólido (preferentemente tema color)
- Sin margen de seguridad requerido

**Icons maskable:**
- Logo centrado
- Área segura: círculo de 80% al centro
- Se puede cortar la imagen alrededor
- Útil para formas raras de app icons

### Colores recomendados:
- **Primario**: #6366f1 (Indigo)
- **Fondo**: #ffffff (Blanco)
- **Logo**: Blanco sobre primario

## Herramientas para generar iconos

### Online:
1. **Web App Manifest Generator**: https://www.favicon-generator.org/
2. **PWA Assets Generator**: https://www.pwabuilder.com/imageGenerator
3. **Favicon.io**: https://favicon.io/
4. **Maskable.app**: https://maskable.app/editor (para maskable icons)

### LocalMente:

**Con ImageMagick:**
```bash
# Convertir imagen 512x512 a 192x192
convert input-512.png -resize 192x192 icon-192x192.png

# Crear favicon.ico
convert input-192.png -define icon:auto-resize=192,192,64,64,48,48,32,32,16,16 favicon.ico
```

**Con Sharp (Node.js):**
```javascript
const sharp = require('sharp');

async function generateIcons() {
  const image = sharp('logo.png');
  
  // 192x192
  await image.resize(192, 192).png().toFile('public/icon-192x192.png');
  
  // 512x512
  await image.resize(512, 512).png().toFile('public/icon-512x512.png');
}
```

## Validación

### Verificar en DevTools:
1. Abre DevTools
2. Ve a **Application** → **Manifest**
3. Verifica que todos los iconos sean cargados correctamente
4. Inspecciona con el **Lighthouse** (Application → Lighthouse)

### PWA Checklist:
- ✅ manifest.json válido
- ✅ Service Worker registrado
- ✅ HTTPS (en producción)
- ✅ Iconos de 192x192 y 512x512
- ✅ Display mode: standalone

## Testing de instalación

### Chrome/Edge:
1. Abre DevTools → Application → Service Workers
2. Verifica "Update on reload"
3. Busca el botón "Install" en la barra de direcciones
4. Click para instalar la app

### Firefox:
1. Ve a preferencias de app
2. Click derecho → "Install"

### Safari (iOS):
1. Botón de compartir
2. "Add to Home Screen"

### Lighthouse Score:
```
npm run build
npm run preview
# Abre DevTools → Lighthouse
# Run audit para Progressive Web App
```

## Troubleshooting

**Iconos no se cargan:**
- Verificar que la ruta sea correcta en manifest.json
- Asegurar que el archivo exista en `public/`
- Limpiar caché del navegador

**App no instalable:**
- Comprobar que el manifest.json sea válido (JSON.parse)
- Verificar HTTPS (en producción)
- Revisar Lighthouse score

**Maskable Icon no se ve bien:**
- Usar https://maskable.app/editor para probar
- Asegurar margen mínimo de 20% desde bordes
- Usar colores contrastantes

## Próximos pasos

1. **Crear los iconos** con las dimensiones especificadas
2. **Colocar en `public/`**
3. **Probar instalación** en diferentes navegadores
4. **Ejecutar Lighthouse** para validar
5. **Deploy** a producción con HTTPS

---

**Nota**: Una vez agregues los iconos, la app será completamente instalable como PWA en:
- ✅ Android (Chrome, Firefox, Edge)
- ✅ iOS (Safari)
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Web

