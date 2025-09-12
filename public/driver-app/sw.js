const CACHE_NAME = 'trinck-driver-v1';
const urlsToCache = [
  '/driver-app/',
  '/driver-app/index.html',
  '/driver-app/app.js',
  '/driver-app/manifest.json',
  '/logo.png',
  '/logo.ico'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for location updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'location-sync') {
    event.waitUntil(syncLocationData());
  }
});

async function syncLocationData() {
  // Handle background location sync when network is available
  try {
    const pendingLocations = await getStoredLocations();
    for (const location of pendingLocations) {
      await sendLocationToServer(location);
    }
    await clearStoredLocations();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getStoredLocations() {
  // Get locations stored in IndexedDB
  return [];
}

async function sendLocationToServer(location) {
  // Send location update to server
  return fetch('/api/driver/location', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(location)
  });
}

async function clearStoredLocations() {
  // Clear sent locations from storage
}
