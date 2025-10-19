/* ============================================================
   🌎 EcoMap Service Worker - v3
   Autor: Lucas Román / SaltaCoders
   Última actualización: 2025-10-18
   ------------------------------------------------------------
   Objetivos:
   ✅ Evitar cachear las llamadas al backend PHP
   ✅ Forzar actualización automática de iconos, manifest y UI
   ✅ Mantener cache local para recursos estáticos
   ✅ Mejor compatibilidad con PWA en Android / iOS
   ============================================================ */

const CACHE_NAME = 'ecomap-v3';
const RUNTIME_CACHE = 'ecomap-runtime';

// Archivos base que se precargan
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

/* ============================================================
   🧱 INSTALACIÓN
   ------------------------------------------------------------
   Descarga y cachea los archivos base de la app.
   ============================================================ */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // ⚡ Fuerza activación inmediata del SW
  );
});

/* ============================================================
   🧹 ACTIVACIÓN
   ------------------------------------------------------------
   Elimina versiones antiguas del caché y toma control inmediato.
   ============================================================ */
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        )
      )
      .then(() => self.clients.claim()) // Control inmediato de todas las pestañas
  );
});

/* ============================================================
   🚀 FETCH: ESTRATEGIA DE RESPUESTA
   ------------------------------------------------------------
   - No cachea llamadas al backend (PHP)
   - Network first para HTML
   - Cache first para estáticos
   ============================================================ */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 🚫 No cachear ninguna solicitud al backend PHP
  if (url.pathname.endsWith('.php')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 🚫 No cachear llamadas externas (ej: Google Maps)
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // 📄 Navegación HTML → Network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // ⚡ Forzar actualización de manifest e íconos si hay cambios
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/manifest.json', response.clone());
            cache.put('/icon-192.svg', response.clone());
            cache.put('/icon-512.svg', response.clone());
          });
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 🧱 Otros recursos → Cache first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request).then((response) => {
          if (response.status === 200 && event.request.method === 'GET') {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});

/* ============================================================
   🔁 FORZAR ACTUALIZACIÓN AUTOMÁTICA
   ------------------------------------------------------------
   Permite que el nuevo SW reemplace versiones viejas
   sin requerir interacción del usuario.
   ============================================================ */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ============================================================
   🔄 NOTIFICAR A CLIENTES CUANDO HAY NUEVA VERSIÓN
   ------------------------------------------------------------
   Envía mensaje a las pestañas activas cuando el SW se actualiza.
   ============================================================ */
self.addEventListener('activate', async () => {
  const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clientsList) {
    client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
  }
});
