const CACHE = 'teleman2-v424';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Dejar pasar sin cachear: Supabase, Google, CDNs, fuentes
  if(e.request.url.includes('supabase') ||
     e.request.url.includes('googleapis') ||
     e.request.url.includes('google') ||
     e.request.url.includes('cdn') ||
     e.request.url.includes('fonts')) {
    return;
  }

  // Network-first: siempre intenta la red primero
  // Solo usa cache si no hay conexión
  e.respondWith(
    fetch(e.request).then(response => {
      if(response.ok) {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => {
      // Sin conexión: usa cache como fallback
      return caches.match(e.request);
    })
  );
});
