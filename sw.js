// Service worker voor "Kan de was buiten?"
// Bewaart de app zelf (zodat hij snel opent), maar haalt weergegevens altijd vers op.
const CACHE = "wasweer-v5";
const APP = ["./", "index.html", "manifest.webmanifest", "favicon-32.png", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // weer-API's: altijd live
  // Eerst online proberen (zodat updates direct doorkomen), anders de bewaarde versie
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })   // altijd bij GitHub checken, niet de browsercache gebruiken
      .then(res => { const kopie = res.clone(); caches.open(CACHE).then(c => c.put(e.request, kopie)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
