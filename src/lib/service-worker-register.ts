/**
 * Service Worker Registration
 * Maneja la instalación y actualización del Service Worker
 */

type ServiceWorkerUpdateCallback = () => void

interface ServiceWorkerManager {
  register: () => Promise<ServiceWorkerRegistration | null>
  unregister: () => Promise<void>
  onUpdate: (callback: ServiceWorkerUpdateCallback) => void
}

let updateCallback: ServiceWorkerUpdateCallback | null = null

export const ServiceWorkerManager: ServiceWorkerManager = {
  register: async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service Workers not supported')
      return null
    }

    try {
      console.log('[SW] Registering Service Worker...')
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        {
          scope: '/',
        }
      )

      console.log('[SW] Service Worker registered successfully', registration)

      // Escuchar cambios en la instalación
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        console.log('[SW] Update found, new worker installing...')

        newWorker.addEventListener('statechange', () => {
          // El nuevo worker está instalado pero no activado aún
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New version available')
            // Notificar que hay una actualización
            if (updateCallback) {
              updateCallback()
            }
          }
        })
      })

      // Escuchar cuando el nuevo Service Worker está controlando
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return
        refreshing = true
        console.log('[SW] Controller changed, reloading page...')
        globalThis.location.reload()
      })

      return registration
    } catch (error) {
      console.error('[SW] Registration failed:', error)
      return null
    }
  },

  unregister: async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log('[SW] Unregistered successfully')
      }
    } catch (error) {
      console.error('[SW] Unregistration failed:', error)
    }
  },

  onUpdate: (callback: ServiceWorkerUpdateCallback) => {
    updateCallback = callback
  },
}

/**
 * Utilidades para comunicarse con el Service Worker
 */
export const ServiceWorkerUtils = {
  /**
   * Notifica al Service Worker que salte espera (actualización inmediata)
   */
  skipWaiting: () => {
    if (!navigator.serviceWorker.controller) return

    navigator.serviceWorker.controller?.postMessage({
      type: 'SKIP_WAITING',
    })
  },

  /**
   * Limpia todos los cachés
   */
  clearCache: () => {
    if (!navigator.serviceWorker.controller) return

    navigator.serviceWorker.controller?.postMessage({
      type: 'CLEAR_CACHE',
    })
  },

  /**
   * Obtiene información de los cachés
   */
  getCacheInfo: async () => {
    if (!('caches' in globalThis)) return null

    const cacheNames = await caches.keys()
    const cacheInfo: Record<string, number> = {}

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      cacheInfo[cacheName] = keys.length
    }

    return cacheInfo
  },

  /**
   * Fuerza sincronización en background
   */
  requestSync: async (tag: string = 'sync-data') => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in globalThis)) return false

    try {
      const registration = await navigator.serviceWorker.ready
      // @ts-expect-error - SyncManager es opcional
      await registration.sync.register(tag)
      console.log('[SW] Sync registered:', tag)
      return true
    } catch (error) {
      console.error('[SW] Sync registration failed:', error)
      return false
    }
  },
}

export default ServiceWorkerManager
