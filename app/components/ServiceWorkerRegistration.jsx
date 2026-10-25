'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegistration
 * Registers the image-caching service worker on the client side.
 * Must be a Client Component because it accesses `navigator`.
 * 
 * v5: Videos now bypass cache entirely (fixes loading issues)
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register the Service Worker for Image Caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log(
              '✅ Service Worker Registered (v5 - Videos bypass cache)',
              registration.scope
            );
            
            // Auto-update when new service worker is waiting
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, activate it
                  console.log('🔄 New Service Worker available, activating...');
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  
                  // Reload page after new SW activates
                  navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('✅ Service Worker updated, reloading page...');
                    window.location.reload();
                  });
                }
              });
            });
            
            // Check for updates periodically (every 30 minutes)
            setInterval(() => {
              registration.update();
            }, 30 * 60 * 1000);
          })
          .catch((error) => {
            console.log('❌ Service Worker Registration failed:', error);
          });
      });
      
      // Expose cache clearing function globally for debugging
      window.clearInvitationCache = async () => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const messageChannel = new MessageChannel();
          
          return new Promise((resolve) => {
            messageChannel.port1.onmessage = (event) => {
              if (event.data.success) {
                console.log('✅ Cache cleared successfully');
                resolve(true);
              }
            };
            
            navigator.serviceWorker.controller.postMessage(
              { type: 'CLEAR_CACHE' },
              [messageChannel.port2]
            );
          });
        }
        
        // Fallback: clear all caches manually
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ All caches cleared (fallback method)');
        return true;
      };
    }
  }, []);

  // Renders nothing — purely a side-effect component
  return null;
}
