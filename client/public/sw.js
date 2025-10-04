/* eslint-disable no-console, no-undef, @typescript-eslint/no-unused-vars */
/* TODO: PWA - Legacy service worker will be refactored in next PR to use Vite PWA plugin properly */
// Vue 3 Quiz Platform Service Worker
const CACHE_NAME = "quiz-platform-v1.0.0";
const STATIC_CACHE = "quiz-platform-static-v1.0.0";
const DYNAMIC_CACHE = "quiz-platform-dynamic-v1.0.0";

// Static assets to cache
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/offline.html",
];

// API routes to cache
const API_ROUTES = ["/api/quizzes", "/api/pricing", "/api/auth/me"];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: "cache-first",
  // Network first for API calls
  NETWORK_FIRST: "network-first",
  // Stale while revalidate for dynamic content
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else if (isHTMLRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Cache first strategy - for static assets
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache first failed:", error);
    return new Response("Network error", { status: 503 });
  }
}

// Network first strategy - for API requests
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for HTML requests
    if (isHTMLRequest(request)) {
      return caches.match("/offline.html");
    }

    return new Response("Offline", { status: 503 });
  }
}

// Stale while revalidate strategy - for HTML pages
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // If network fails, return cached version or offline page
      return cachedResponse || caches.match("/offline.html");
    });

  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith("/api/");
}

function isHTMLRequest(request) {
  return request.headers.get("accept")?.includes("text/html");
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "quiz-submission") {
    event.waitUntil(syncQuizSubmissions());
  } else if (event.tag === "user-feedback") {
    event.waitUntil(syncUserFeedback());
  }
});

// Sync quiz submissions when back online
async function syncQuizSubmissions() {
  try {
    const pendingSubmissions = await getPendingSubmissions();

    for (const submission of pendingSubmissions) {
      try {
        await fetch("/api/quiz/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submission.data),
        });

        await removePendingSubmission(submission.id);
        console.log("[SW] Quiz submission synced:", submission.id);
      } catch (error) {
        console.error("[SW] Failed to sync quiz submission:", error);
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
  }
}

// Sync user feedback when back online
async function syncUserFeedback() {
  try {
    const pendingFeedback = await getPendingFeedback();

    for (const feedback of pendingFeedback) {
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedback.data),
        });

        await removePendingFeedback(feedback.id);
        console.log("[SW] User feedback synced:", feedback.id);
      } catch (error) {
        console.error("[SW] Failed to sync user feedback:", error);
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
  }
}

// IndexedDB helpers for offline storage
async function getPendingSubmissions() {
  return new Promise((resolve) => {
    const request = indexedDB.open("QuizPlatform", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["submissions"], "readonly");
      const store = transaction.objectStore("submissions");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };

    request.onerror = () => {
      resolve([]);
    };
  });
}

async function removePendingSubmission(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open("QuizPlatform", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["submissions"], "readwrite");
      const store = transaction.objectStore("submissions");
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => {
        resolve();
      };
    };

    request.onerror = () => {
      resolve();
    };
  });
}

async function getPendingFeedback() {
  return new Promise((resolve) => {
    const request = indexedDB.open("QuizPlatform", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["feedback"], "readonly");
      const store = transaction.objectStore("feedback");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };

    request.onerror = () => {
      resolve([]);
    };
  });
}

async function removePendingFeedback(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open("QuizPlatform", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["feedback"], "readwrite");
      const store = transaction.objectStore("feedback");
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => {
        resolve();
      };
    };

    request.onerror = () => {
      resolve();
    };
  });
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const options = {
    body: event.data ? event.data.text() : "New quiz available!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      url: "/quizzes",
    },
    actions: [
      {
        action: "open",
        title: "Open Quiz",
        icon: "/icons/open-icon.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/close-icon.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Vue 3 Quiz Platform", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
  }
});

// Message handling from main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("[SW] Service worker loaded successfully");
