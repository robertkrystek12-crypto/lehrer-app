/**
 * Service Worker der Lehrer-App.
 *
 * Aufgabe: Die App soll nach dem ersten Aufruf ohne Netz starten — im
 * Klassenraum ist das WLAN nicht garantiert, und eine Notenliste, die ohne
 * Internet nicht aufgeht, ist im Unterricht wertlos.
 *
 * Wichtig: Hier werden ausschließlich die Programmdateien zwischengespeichert.
 * Die Schülerdaten liegen verschlüsselt in IndexedDB und laufen NIE über den
 * Service Worker oder über das Netz.
 */

const CACHE = 'lehrer-app-v1';

// Beim Installieren die Einstiegsseite vorladen, damit der erste Offline-Start klappt.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['./', './index.html', './manifest.webmanifest']))
      .catch(() => {
        /* Einzelne Fehlschläge dürfen die Installation nicht verhindern. */
      })
      .then(() => self.skipWaiting()),
  );
});

// Alte Cache-Versionen aufräumen.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Nur eigene GET-Anfragen anfassen.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Seitenaufrufe: erst Netz (damit Updates ankommen), sonst Cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('./index.html'))),
    );
    return;
  }

  const pfad = new URL(request.url).pathname;

  /*
   * Nur die von Vite erzeugten Dateien in /assets/ dürfen bevorzugt aus dem
   * Cache kommen: deren Name enthält einen Inhalts-Hash, eine geänderte Datei
   * bekommt also einen neuen Namen und kann gar nicht veralten.
   *
   * Alles andere (Icons, Manifest, sonstige Dateien aus public/) behält seinen
   * Namen über Versionen hinweg. Käme das aus dem Cache, würde eine
   * aktualisierte Datei nie ankommen — deshalb hier zuerst das Netz und der
   * Cache nur als Rückfallebene für den Offline-Betrieb.
   */
  const istGehashteDatei = pfad.includes('/assets/');

  if (istGehashteDatei) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
