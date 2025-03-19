permalink: "/sw.js"
layout: null
sitemap: false
---
const version = '{{ site.time | date: "%Y%m%d%H%M%S" }}';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return [
    // Cache latest 10 blog posts
    {%- for post in site.posts limit: 10 -%}
      {%- if post.published -%}
        "{{ post.url | relative_url }}",
      {%- endif -%}
    {%- endfor -%}

    // Cache all site pages, excluding 404 & sw.js
    {%- for page in site.pages -%}
      {%- unless page.url contains 'sw.js' or page.url contains '404.html' or page.sitemap == false -%}
        "{{ page.url | relative_url }}",
      {%- endunless -%}
    {%- endfor -%}

    // Cache important assets
    "{{ site.baseurl }}/offline.html",
    "{{ site.logo | relative_url }}",
    "{{ site.baseurl }}/assets/default-offline-image.png",
    "{{ site.baseurl }}/assets/scripts/fetch.js"
  ];
};

const updateStaticCache = async () => {
  const cache = await caches.open(cacheName);
  try {
    await cache.addAll(buildContentBlob());
    console.log(`Service Worker: cache updated to version: ${cacheName}`);
  } catch (error) {
    console.error("Service Worker: Cache update failed", error);
  }
};

const clearOldCache = async () => {
  const keys = await caches.keys();
  console.log("Available caches:", keys);

  return Promise.all(
    keys
      .filter(key => key !== cacheName && key.startsWith("static::"))
      .map(async key => {
        console.log(`Service Worker: removing old cache ${key}`);
        return caches.delete(key);
      })
  );
};

self.addEventListener("install", event => {
  event.waitUntil(updateStaticCache());
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  if (url.origin !== location.origin) {
    return;
  }

  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Offline asset handling
  let offlineAsset = "{{ site.baseurl }}/offline.html";
  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    offlineAsset = "{{ site.baseurl }}/assets/default-offline-image.png";
  }

  // Handle API caching
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          let clone = response.clone();
          caches.open(cacheName).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          return caches.match(request) || new Response(JSON.stringify({ error: "Offline data unavailable" }), { headers: { "Content-Type": "application/json" } });
        })
    );
    return;
  }

  // Default fetch handling
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
});
