const CACHE_NAME = 'pizzaria-gatito-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Recursos para cache estático (sempre em cache)
const STATIC_ASSETS = [
  '/',
  '/styles/styles.css',
  '/script.js',
  '/manifest.json',
  '/audio.wav'
];

// Recursos para cache dinâmico (cache conforme uso)
const DYNAMIC_ASSETS = [
  '/api/',
  '/data/',
  '/utils/',
  '/imagens/'
];

// Instalar service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: Error caching static assets', err);
      })
  );
});

// Ativar service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estratégia Cache First para recursos estáticos
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(fetchResponse => {
              return caches.open(STATIC_CACHE)
                .then(cache => {
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
        .catch(() => {
          // Fallback para offline
          if (request.destination === 'document') {
            return caches.match('/');
          }
        })
    );
    return;
  }
  
  // Estratégia Network First para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache apenas respostas bem-sucedidas
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache em caso de erro de rede
          return caches.match(request);
        })
    );
    return;
  }
  
  // Estratégia Cache First para imagens e recursos dinâmicos
  if (DYNAMIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            // Atualiza cache em background
            fetch(request)
              .then(fetchResponse => {
                if (fetchResponse.status === 200) {
                  caches.open(DYNAMIC_CACHE)
                    .then(cache => {
                      cache.put(request, fetchResponse);
                    });
                }
              })
              .catch(() => {});
            return response;
          }
          
          return fetch(request)
            .then(fetchResponse => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then(cache => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            });
        })
    );
    return;
  }
  
  // Para outras requisições, usar estratégia padrão
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Limpar cache antigo periodicamente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
    );
  }
});
