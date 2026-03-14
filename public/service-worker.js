const CACHE_VERSION = 'v1'
const CACHE_NAMES = {
  dynamic: `fitconnect-dynamic-${CACHE_VERSION}`,
  static: `fitconnect-static-${CACHE_VERSION}`,
  images: `fitconnect-images-${CACHE_VERSION}`,
  api: `fitconnect-api-${CACHE_VERSION}`,
}

// Assets estáticos que se cachean en la instalación
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          const isOldCache = !Object.values(CACHE_NAMES).includes(cacheName)
          if (isOldCache) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Estrategia de request handling
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // No cachear requests de supabase en ciertos casos
  if (url.hostname === 'localhost' && url.port === '5173') {
    // Dev server - network first
    event.respondWith(networkFirst(request))
    return
  }

  // API calls (supabase) - network first con fallback
  if (url.hostname.includes('supabase') || request.method !== 'GET') {
    event.respondWith(networkFirst(request))
    return
  }

  // Imágenes - cache first
  if (request.destination === 'image') {
    event.respondWith(cacheImages(request))
    return
  }

  // JS, CSS, y assets - cache first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML - network first
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request))
    return
  }

  // Por defecto - network first
  event.respondWith(networkFirst(request))
})

// Network first strategy: intenta red primero, usa caché como fallback
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      // Cachear la respuesta exitosa
      const cacheName =
        request.destination === 'script' || request.destination === 'style'
          ? CACHE_NAMES.static
          : CACHE_NAMES.dynamic
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('[Service Worker] Network request failed, using cache:', request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Respuesta genérica offline
    if (request.destination === 'document') {
      const cache = await caches.open(CACHE_NAMES.static)
      return cache.match('/') || new Response('Offline - No cached version available', {
        status: 503,
        statusText: 'Service Unavailable',
      })
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }
}

// Cache first strategy: usa caché primero, red como fallback
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAMES.static)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('[Service Worker] Cache and network failed for:', request.url)
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }
}

// Cache images - guarda imágenes con versionamiento
async function cacheImages(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAMES.images)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('[Service Worker] Failed to cache image:', request.url)
    // Retorna imagen placeholder o error image
    return new Response('Image not available', {
      status: 404,
      statusText: 'Not Found',
    })
  }
}

// Manejo de mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
    })
  }
})

// Sincronización en background (cuando regresa conexión)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí puedes sincronizar datos pendientes
      Promise.resolve()
    )
  }
})

console.log('[Service Worker] Loaded')
