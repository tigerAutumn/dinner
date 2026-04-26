// dinner PWA service worker
// 静态资源更新时 bump 版本号触发清缓存
const CACHE_NAME = 'dinner-v1'

// 应用外壳：同源资源预缓存（必装成功，否则 install 失败）
// 路径相对 SW location，自动适配 GitHub Pages 子路径与本地 root
const SHELL = [
  './',
  './index.html',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './manifest.webmanifest'
]
const SHELL_ROOT = new URL('./', self.location.href).href

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  // 地图瓦片：交给浏览器自己处理，不缓存（量大且常变）
  if (
    url.hostname.endsWith('basemaps.cartocdn.com') ||
    url.hostname.endsWith('tile.openstreetmap.org')
  ) {
    return
  }

  // 导航/HTML：网络优先 → 失败回退缓存（保证 web 用户拿到最新内容）
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(e.request).then(r => r || caches.match(SHELL_ROOT))
      )
    )
    return
  }

  // 其他静态资源（Leaflet/字体/图标）：缓存优先 → 网络回填
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone))
        }
        return res
      }).catch(() => cached)
    })
  )
})
