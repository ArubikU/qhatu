/* Qhatu service worker — push notifications + offline app shell (S6) */

const CACHE = 'qhatu-v2'
const APP_SHELL = ['/', '/feed', '/login', '/offline', '/manifest.json', '/isotipo.png', '/logotipo.png']

// ─── Install: pre-cache app shell ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  )
})

// ─── Activate: drop old caches ─────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// ─── Fetch strategy ────────────────────────────────────────────────────────────
//  - API (/api/*): network-only (never cache auth/feed data)
//  - Navigations: network-first, fall back to cache, then /offline
//  - Static assets: stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/')) return  // let the network handle it

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match(request).then((c) => c || caches.match('/offline'))),
    )
    return
  }

  // Static assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
            return res
          })
          .catch(() => cached)
        return cached || network
      }),
    )
  }
})

// ─── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'Qhatu', body: event.data.text() } }

  const title = data.title || 'Qhatu'
  const options = {
    body:  data.body || '',
    icon:  '/isotipo.png',
    badge: '/isotipo.png',
    tag:   data.tag || 'qhatu',
    data:  { url: data.url || '/notifications' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/notifications'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) { client.navigate(url); return client.focus() }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
