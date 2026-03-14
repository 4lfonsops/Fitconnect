# PWA Configuration - FitConnect

Este proyecto incluye una configuración completa de Progressive Web App (PWA) para permitir:
- ✅ Instalación como aplicación nativa
- ✅ Funcionalidad offline
- ✅ Caching inteligente
- ✅ Actualizaciones automáticas
- ✅ Acceso rápido desde el home screen

## Archivos PWA

### 1. **manifest.json** (`public/manifest.json`)
Define los metadatos de la PWA:
- Nombre y descripción de la app
- Iconos (diferentes tamaños y propósitos)
- Shortcuts para acceso rápido
- Colores de tema y fondo
- Display mode (standalone)

### 2. **Service Worker** (`public/service-worker.js`)
Gestiona el caching y funcionalidad offline:
- **Cache First**: JS, CSS, fuentes e imágenes (más rápido)
- **Network First**: Requests de API y HTML (siempre actualizado)
- Limpieza automática de cachés antiguos
- Sincronización en background
- Manejo offline elegante

### 3. **Service Worker Register** (`src/lib/service-worker-register.ts`)
Utilidades para registrar y comunicarse con el Service Worker:
```typescript
// Registrar el SW
ServiceWorkerManager.register()

// Escuchar actualizaciones
ServiceWorkerManager.onUpdate(() => {
  // Mostrar notificación de actualización
})

// Utilidades
ServiceWorkerUtils.skipWaiting()  // Actualizar inmediatamente
ServiceWorkerUtils.clearCache()   // Limpiar cachés
ServiceWorkerUtils.requestSync()  // Sincronización en background
```

### 4. **Update Prompt** (`src/components/UpdatePrompt.tsx`)
Componente que muestra una notificación cuando hay una nueva versión disponible.
El usuario puede:
- ✅ Actualizar inmediatamente
- ⏱️ Actualizar más tarde

## Configuración en index.html

Se agregaron meta tags para PWA:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#6366f1" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

And automatic Service Worker registration:
```javascript
navigator.serviceWorker.register('/service-worker.js')
```

## Uso

### Para el usuario final:
1. Abrir la app en el navegador
2. En Chrome/Edge: Botón de instalación en la barra de direcciones
3. En iOS Safari: Compartir → Agregar a pantalla de inicio

### Para el desarrollo:

**Desactivar Service Worker en Dev:**
```typescript
// En desarrollo, los cambios se reciben en tiempo real
// Si necesitas purgar caché manualmente:
await ServiceWorkerUtils.clearCache()
```

**Probrar offline:**
1. Network tab en DevTools → Offline
2. La app seguirá funcionando con datos cacheados

**Forzar nueva versión:**
```typescript
ServiceWorkerUtils.skipWaiting()
```

## Estrategias de Caching

| Resource | Estrategia | Ventaja |
|----------|-----------|---------|
| JS/CSS/Fonts | Cache First | Carga rápida |
| Imágenes | Cache First | Menos ancho de banda |
| API/Datos | Network First | Datos siempre frescos |
| HTML | Network First | Actualizado, fallback cached |

## Configuración recomendada

### Para Vercel/Netlify:
Asegurar que estos archivos sean servidos con los headers correctos:
- `public/manifest.json`: Content-Type: `application/manifest+json`
- `public/service-worker.js`: Content-Type: `application/javascript`, no cache

### Versionamiento:
Cambiar `CACHE_VERSION` en `public/service-worker.js` para invalidar cachés:
```javascript
const CACHE_VERSION = 'v2'  // Incrementar cuando haya cambios importantes
```

## Debugging

Abrir DevTools → Application tab:
- **Manifest**: Ver manifest.json parseado
- **Service Workers**: Estado, registro, actualizar/skip
- **Cache Storage**: Ver cachés y contenido
- **Storage**: Verificar datos almacenados

## Next Steps

1. **Agregar iconos**:
   - icon-192x192.png
   - icon-192x192-maskable.png
   - icon-512x512.png
   - icon-512x512-maskable.png

2. **Actualizar colores** en manifest.json según tu brand

3. **Testing**:
   - Lighthouse audit (DevTools)
   - Instalar en Android/iOS
   - Pruebas offline

## Recursos

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA on iOS](https://appshopper.com/blog/how-to-add-progressive-web-apps-to-home-screen/)
