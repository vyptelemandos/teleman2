const CACHE = 'teleman2-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  // Solo cachear recursos propios, dejar pasar el resto
  if(e.request.url.includes('supabase') || 
     e.request.url.includes('googleapis') ||
     e.request.url.includes('google') ||
     e.request.url.includes('cdn') ||
     e.request.url.includes('fonts')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(response => {
        if(response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
