// SkinMatch — service worker
// Doit être servi comme un vrai fichier depuis la même origine : un service worker
// enregistré depuis une URL blob: est refusé par les navigateurs.
const VERSION = 'sm-v6';
const CACHE_APP  = VERSION + '-app';
const CACHE_DATA = VERSION + '-data';

// Coquille de l'application, mise en cache à l'installation.
const SHELL = ['./', './index.html', './pharmacie.html', './manifest.json',
               './manifest-pharmacie.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_APP).then((c) => Promise.all(
      SHELL.map((u) => c.add(u).catch(() => null))   // une ressource absente ne fait pas échouer l'installation
    ))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Jamais de cache pour l'authentification et la base de données : ces réponses
  // sont propres à l'utilisateur et doivent rester fraîches.
  if (/googleapis|firebaseio|firebaseapp|generativelanguage/.test(url.hostname)) return;

  // Navigation : réseau d'abord, cache en secours (permet l'usage hors ligne).
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copy = r.clone();
          const cle = url.pathname.indexOf('pharmacie') > -1 ? './pharmacie.html' : './index.html';
          caches.open(CACHE_APP).then((c) => c.put(cle, copy));
          return r;
        })
        .catch(() => {
          // Hors ligne : servir la page correspondant à l'adresse demandée,
          // sinon la borne retomberait sur l'application grand public.
          const cible = url.pathname.indexOf('pharmacie') > -1 ? './pharmacie.html' : './index.html';
          return caches.match(cible).then((r) => r || caches.match('./'));
        })
    );
    return;
  }

  // Index des codes-barres : volumineux et stable, cache d'abord.
  if (url.pathname.endsWith('pharma-index.json')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((r) => {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE_DATA).then((c) => c.put(req, copy)); }
        return r;
      }))
    );
    return;
  }

  // Polices, images, styles : cache d'abord, réseau en secours.
  if (/\.(png|jpg|jpeg|svg|webp|woff2?|css)$/.test(url.pathname) || /fonts\.(googleapis|gstatic)/.test(url.hostname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((r) => {
        if (r.ok && (url.origin === location.origin || /fonts\./.test(url.hostname))) {
          const copy = r.clone(); caches.open(CACHE_APP).then((c) => c.put(req, copy));
        }
        return r;
      }).catch(() => hit))
    );
  }
});
