/* Qhatu service worker — DESACTIVADO.
 *
 * El caching de navegaciones/RSC interfería con el router de Next (App Router):
 * las navegaciones quedaban atascadas hasta forzar un re-render. No vale la pena
 * mantener offline a costa de romper la navegación, así que este worker se
 * auto-desregistra, limpia todas las caches y recarga los clientes controlados.
 * Cualquier cliente con un SW viejo (v2/v3) recibirá esto y quedará limpio.
 */
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    } catch { /* noop */ }
    try { await self.registration.unregister() } catch { /* noop */ }
    // Recarga los clientes para que corran sin SW (navegación normal de Next).
    const clients = await self.clients.matchAll({ type: 'window' })
    for (const c of clients) { try { c.navigate(c.url) } catch { /* noop */ } }
  })())
})

// Sin handler de fetch → el SW NO intercepta ninguna request.
