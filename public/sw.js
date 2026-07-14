// Service Worker para Z-Services AI - Modo Offline
const CACHE_NAME = 'z-services-v1';
const OFFLINE_URL = '/offline.html';

// Arquivos essenciais para cache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Ativar imediatamente
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Tomar controle imediatamente
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    // Para POST/PUT/DELETE, tentar sincronizar depois se offline
    if (!navigator.onLine) {
      event.respondWith(
        (async () => {
          // Armazenar para sincronização posterior
          await storePendingRequest(request);
          return new Response(
            JSON.stringify({ 
              success: false, 
              offline: true, 
              message: 'Request queued for sync' 
            }),
            { 
              status: 202,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })()
      );
    }
    return;
  }

  // Ignorar requisições para API externa
  if (url.origin !== location.origin) {
    return;
  }

  // Estratégia: Network First com fallback para Cache
  event.respondWith(
    (async () => {
      try {
        // Tentar buscar da rede primeiro
        const networkResponse = await fetch(request);
        
        // Se sucesso, armazenar no cache
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Se offline, tentar buscar do cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
          return cachedResponse;
        }

        // Se for uma página de navegação, mostrar página offline
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }

        // Retornar erro para outros recursos
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});

// Escutar quando voltar online
self.addEventListener('online', () => {
  console.log('[SW] Back online, syncing pending requests...');
  syncPendingRequests();
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

// Armazenar requisição pendente no IndexedDB
async function storePendingRequest(request) {
  const db = await openDatabase();
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now(),
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingRequests'], 'readwrite');
    const store = transaction.objectStore('pendingRequests');
    const request_ = store.add(requestData);
    
    request_.onsuccess = () => resolve(request_.result);
    request_.onerror = () => reject(request_.error);
  });
}

// Sincronizar requisições pendentes
async function syncPendingRequests() {
  const db = await openDatabase();
  const transaction = db.transaction(['pendingRequests'], 'readwrite');
  const store = transaction.objectStore('pendingRequests');
  
  return new Promise((resolve) => {
    const request_ = store.getAll();
    
    request_.onsuccess = async () => {
      const pendingRequests = request_.result;
      
      for (const req of pendingRequests) {
        try {
          await fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: req.body,
          });
          
          // Remover do IndexedDB se sucesso
          store.delete(req.id || req.timestamp);
        } catch (error) {
          console.error('[SW] Failed to sync request:', req.url, error);
        }
      }
      
      resolve(true);
    };
    
    request_.onerror = () => resolve(false);
  });
}

// Abrir IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('z-services-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Criar store para requisições pendentes
      if (!db.objectStoreNames.contains('pendingRequests')) {
        db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
      }
      
      // Criar store para dados do relatório
      if (!db.objectStoreNames.contains('reportData')) {
        db.createObjectStore('reportData', { keyPath: 'id' });
      }
    };
  });
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
