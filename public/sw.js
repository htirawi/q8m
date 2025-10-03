// Service Worker for Offline Support
const CACHE_NAME = "angular-interview-prep-v1";
const urlsToCache = ["/", "/static/js/bundle.js", "/static/css/main.css", "/manifest.json"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === "document") {
          return caches.match("/");
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Sync offline data when back online
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  try {
    // Get offline queue from IndexedDB or localStorage
    const offlineQueue = await getOfflineQueue();

    for (const item of offlineQueue) {
      try {
        await processOfflineItem(item);
        await removeOfflineItem(item.id);
      } catch (error) {
        console.error("Failed to sync item:", item, error);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

async function getOfflineQueue() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

async function processOfflineItem(item) {
  // Process individual offline items
  console.log("Processing offline item:", item);
}

async function removeOfflineItem(itemId) {
  // Remove processed item from queue
  console.log("Removing offline item:", itemId);
}
