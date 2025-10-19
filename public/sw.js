/* ============================================================
   🌎 EcoMap Service Worker - v8
   Autor: Lucas Román / SaltaCoders
   Última actualización: 2025-10-19
   ------------------------------------------------------------
   Objetivos:
   ✅ Evitar cachear las llamadas al backend PHP
   ✅ Forzar actualización automática de iconos, manifest y UI
   ✅ Mantener cache local para recursos estáticos
   ✅ Mejor compatibilidad con PWA en Android / iOS (Safari fix)
   ✅ Notificar a la app cuando hay una nueva versión
   ✅ Soportar imágenes de ambos servidores (nuevo y viejo)
   ✅ Safari iOS: cache: 'no-store' para peticiones dinámicas
   ============================================================ */

const CACHE_NAME = 'ecomap-v8';
const RUNTIME_CACHE = 'ecomap-runtime-v8';

// Archivos base que se precargan
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json?v=8',
  '/icon-192.svg?v=8',
  '/icon-512.svg?v=8',
];

/* ============================================================
   🧱 INSTALACIÓN
   ------------------------------------------------------------
   Descarga y cachea los archivos base de la app.
   ============================================================ */
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker v8 instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => {
        console.log('✅ Archivos cacheados, notificando clientes...');
        // Notificar a todos los clientes que hay una nueva versión
        return self.clients.matchAll({ includeUncontrolled: true });
      })
      .then((clients) => {
        console.log(`📢 Notificando a ${clients.length} clientes`);
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: CACHE_NAME,
            timestamp: Date.now()
          });
        });
        return self.skipWaiting(); // ⚡ Fuerza activación inmediata del SW
      })
  );
});

/* ============================================================
   🧹 ACTIVACIÓN
   ------------------------------------------------------------
   Elimina versiones antiguas del caché y toma control inmediato.
   ============================================================ */
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker v8 activado');
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log(`🗑️ Eliminando caché antiguo: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        )
      )
      .then(() => {
        console.log('📡 Tomando control de todos los clientes...');
        return self.clients.claim();
      })
      .then(() => {
        // Notificar nuevamente después de activar
        return self.clients.matchAll({ includeUncontrolled: true });
      })
      .then((clients) => {
        console.log(`📢 Post-activación: Notificando a ${clients.length} clientes`);
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: CACHE_NAME,
            timestamp: Date.now()
          });
        });
      })
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

  // 🚫 Evitar cachear cualquier llamada al backend PHP o con parámetros "action="
  if (url.pathname.endsWith('.php') || url.searchParams.has('action')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => response)
        .catch(() => new Response(JSON.stringify({ ok: false, error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        }))
    );
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
