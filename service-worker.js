const CACHE_NAME = 'browser-notepad-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://radical.omar-c29.workers.dev/memes/fry.png',
  'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        ).catch(() => {
          // If fetch fails (offline), try to return the cached HTML
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});