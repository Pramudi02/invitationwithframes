const CACHE_NAME = 'wedding-image-cache-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force new SW to activate immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Clearing old cache:', cacheName);
            return caches.delete(cacheName); // Clear old caches
          }
        })
      );
    }).then(() => {
      console.log('Service Worker v5 activated - Videos now bypass cache');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Helper function to detect video content
  const isVideoRequest = () => {
    // Check file extension
    if (url.pathname.match(/\.(mp4|webm|ogg|mov|avi)$/i)) return true;
    
    // Check destination
    if (event.request.destination === 'video') return true;
    
    // Check Cloudinary video URLs
    if (url.hostname.includes('cloudinary.com') && url.pathname.includes('/video/')) return true;
    
    // Check Accept header for video MIME types
    const accept = event.request.headers.get('accept') || '';
    if (accept.includes('video/')) return true;
    
    return false;
  };

  // 🔴 STRICT BYPASS: Let browser handle Navigation, Next.js chunks, APIs, AND VIDEOS
  if (
    event.request.mode === 'navigate' || 
    url.pathname.startsWith('/_next/') || 
    url.pathname.startsWith('/api/') || 
    event.request.method !== 'GET' ||
    isVideoRequest() // Comprehensive video detection
  ) {
    return; // Bypassing SW cache for video stream support (HTTP 206)
  }

  // ✅ ONLY CACHE IMAGES (Explicitly exclude Cloudinary videos)
  const isCloudinaryImage = url.hostname.includes('res.cloudinary.com') && 
                            url.pathname.includes('/image/') && 
                            !url.pathname.includes('/video/');
  
  if (event.request.destination === 'image' || isCloudinaryImage) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          // Don't cache failed requests
          if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // Fallback if offline and image not cached
          return new Response(''); 
        });
      })
    );
  }
});

// Message handler for manual cache control
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('All caches cleared manually');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
