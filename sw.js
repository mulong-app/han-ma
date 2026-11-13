// 韓麻 HEADS-UP service worker: オフラインでも遊べるようにゲーム本体をキャッシュする
const CACHE = 'hanma-v24';
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "tiles/chun.png", "tiles/east.png", "tiles/haku.png", "tiles/hatsu.png", "tiles/m1.png", "tiles/m2.png", "tiles/m3.png", "tiles/m4.png", "tiles/m5.png", "tiles/m5r.png", "tiles/m6.png", "tiles/m7.png", "tiles/m8.png", "tiles/m9.png", "tiles/north.png", "tiles/p1.png", "tiles/p2.png", "tiles/p3.png", "tiles/p4.png", "tiles/p5r.png", "tiles/p6.png", "tiles/p7.png", "tiles/p8.png", "tiles/p9.png", "tiles/s1.png", "tiles/s2.png", "tiles/s3.png", "tiles/s4.png", "tiles/s5r.png", "tiles/s6.png", "tiles/s7.png", "tiles/s8.png", "tiles/s9.png", "tiles/south.png", "tiles/west.png"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html') || url.pathname.endsWith('.webmanifest');
  if (isPage) {
    // ページ本体はネット優先：更新がすぐ反映される。オフライン時だけキャッシュを使う
    e.respondWith(fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./'))));
    return;
  }
  // 牌画像・アイコン・フォントはキャッシュ優先
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && (url.origin === location.origin || e.request.url.includes('fonts.g'))) {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
