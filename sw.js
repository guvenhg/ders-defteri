/* Ders Defteri — servis çalışanı (yayina-hazirla.ps1 üretir) */
const V = 'ders-defteri-20261001-221342';
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

  // Sayfanın kendisi her açılışta sunucuyla doğrulanır: GitHub Pages 10 dakikalık
  // tarayıcı önbelleği verdiği için aksi halde yeni yayın telefona geç ulaşır.
  const req = e.request.mode === 'navigate'
    ? new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
    : e.request;

  e.respondWith(
    fetch(req).then(r => {
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