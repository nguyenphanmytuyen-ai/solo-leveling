/**
 * IndexedDB storage for custom user-uploaded gear images and character GIFs.
 * Prevents exceeding localStorage 5MB limit.
 */

const DB_NAME = 'SoloLevellingGearDB';
const DB_VERSION = 2;
const STORE_NAME = 'custom_gear_blobs';
const CHAR_STORE_NAME = 'custom_char_blobs';

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise(resolve => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(CHAR_STORE_NAME)) {
          db.createObjectStore(CHAR_STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveGearBlob(id: string, blob: Blob): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id, blob, updatedAt: Date.now() });

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function getGearBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  if (!db) return null;

  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        resolve(req.result ? req.result.blob : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function deleteGearBlob(id: string): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// Character GIF Blobs
export async function saveCharBlob(id: string, blob: Blob): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  return new Promise(resolve => {
    try {
      const tx = db.transaction(CHAR_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CHAR_STORE_NAME);
      const req = store.put({ id, blob, updatedAt: Date.now() });

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function getCharBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  if (!db) return null;

  return new Promise(resolve => {
    try {
      const tx = db.transaction(CHAR_STORE_NAME, 'readonly');
      const store = tx.objectStore(CHAR_STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        resolve(req.result ? req.result.blob : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function deleteCharBlob(id: string): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  return new Promise(resolve => {
    try {
      const tx = db.transaction(CHAR_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CHAR_STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Clear all uploaded custom character and gear blobs from IndexedDB
 */
export async function clearAllCustomBlobs(): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  return new Promise(resolve => {
    try {
      const tx = db.transaction([STORE_NAME, CHAR_STORE_NAME], 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.objectStore(CHAR_STORE_NAME).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}
