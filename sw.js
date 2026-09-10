/* Ders Defteri — servis çalışanı (yayina-hazirla.ps1 üretir) */
const V = 'ders-defteri-20260910-160525';
const FILES = ['./index.html', './icon.png', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  let url;
  try { url = new URL(e.request.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.ok) {
        const copy = r.clone();
        caches.open(V).then(c => c.put(e.request, copy)).catch(() => {});
      }
      return r;
    }).catch(() =>
      caches.match(e.request, { ignoreSearch: true }).then(r => {
        if (r) return r;
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
    )
  );
});