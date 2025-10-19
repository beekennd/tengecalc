const CACHE_NAME = 'tengecalc-v1';
const OFFLINE_URL = '/';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // cache fetched files (but avoid opaque cross-origin responses)
        if (response && response.status === 200 && response.type === 'basic'){
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // fallback to cached index.html for navigation requests
        if (event.request.mode === 'navigate') return caches.match('/index.html');
      });
    })
  );
});

--- README.txt ---
Как запустить локально (Service Worker требует HTTPS или localhost):
1) Скачай три файла в одну папку: index.html, manifest.json, service-worker.js
2) Запусти локальный статический сервер. Например, в терминале из папки:
   Python 3: python -m http.server 8000
3) Открой в браузере: http://localhost:8000/
4) Чтобы протестировать PWA на iPhone: открой страницу в Safari (по локальной сети или хосту с HTTPS), затем Share → Add to Home Screen.

Примеры использования через URL:
 - http://localhost:8000/?net=540000&fee=16

Примечание по iOS: iOS поддерживает добавление на экран и офлайн-кэш; но поведение splash screen и некоторые возможности (например background-sync) ограничены. Для стабильной установки рекомендуется HTTPS-хостинг (GitHub Pages, Netlify).

--- END OF PROJECT ---