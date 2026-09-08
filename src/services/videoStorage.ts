/**
 * Persistent IndexedDB Storage for Local Video Files (MP4, WebM, QuickTime).
 * 
 * Browser Blob URLs (blob:http...) expire when a webpage is reloaded.
 * This service persists the actual video Blobs in IndexedDB so that local
 * videos survive page refreshes and browser restarts without black screens.
 */

const DB_NAME = 'NexusHome_MediaVault';
const DB_VERSION = 1;
const STORE_NAME = 'local_videos';

export interface StoredVideoMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: number;
  lastAccessedAt: number;
}

export interface StoredVideoRecord extends StoredVideoMeta {
  blob: Blob;
}

// In-memory cache of active Object URLs to prevent duplicate allocations and manage revocation
const activeObjectUrlMap = new Map<string, string>();

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open MediaVault IndexedDB'));
    };
  });

  return dbPromise;
}

export const videoStorage = {
  /**
   * Saves a video File/Blob directly into IndexedDB.
   */
  async saveVideo(file: Blob | File, customId?: string, fileName?: string): Promise<StoredVideoMeta> {
    const db = await getDB();
    const id = customId || `vid-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const name = fileName || (file instanceof File ? file.name : `Video-${new Date().toLocaleDateString()}`);
    const size = file.size;
    const type = file.type || 'video/mp4';
    const now = Date.now();

    const record: StoredVideoRecord = {
      id,
      name,
      size,
      type,
      blob: file,
      createdAt: now,
      lastAccessedAt: now,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => {
        // Automatically create and cache an active session object URL
        if (activeObjectUrlMap.has(id)) {
          try {
            URL.revokeObjectURL(activeObjectUrlMap.get(id)!);
          } catch {
            // ignore
          }
        }
        const url = URL.createObjectURL(file);
        activeObjectUrlMap.set(id, url);

        resolve({
          id,
          name,
          size,
          type,
          createdAt: now,
          lastAccessedAt: now,
        });
      };

      req.onerror = () => {
        reject(req.error || new Error('Failed to save video to IndexedDB'));
      };
    });
  },

  /**
   * Retrieves the raw video Blob from IndexedDB.
   */
  async getVideoBlob(id: string): Promise<Blob | null> {
    if (!id) return null;
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          const res = req.result as StoredVideoRecord | undefined;
          if (res && res.blob) {
            resolve(res.blob);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => {
          reject(req.error || new Error(`Failed to load video ${id} from IndexedDB`));
        };
      });
    } catch (e) {
      console.warn('getVideoBlob failed', e);
      return null;
    }
  },

  /**
   * Retrieves or creates a valid Blob URL for the current browser session.
   * If already created, reuses the active session URL.
   */
  async getOrCreateVideoUrl(id: string): Promise<string | null> {
    if (!id) return null;

    // Check if we already have an active Object URL in memory
    const existing = activeObjectUrlMap.get(id);
    if (existing) {
      return existing;
    }

    // Otherwise load the blob from IndexedDB and create a fresh Object URL
    const blob = await this.getVideoBlob(id);
    if (!blob) return null;

    const newUrl = URL.createObjectURL(blob);
    activeObjectUrlMap.set(id, newUrl);
    return newUrl;
  },

  /**
   * Returns metadata for all stored videos without loading heavy blobs into memory.
   */
  async listAllVideos(): Promise<StoredVideoMeta[]> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.openCursor();
        const results: StoredVideoMeta[] = [];

        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const val = cursor.value as StoredVideoRecord;
            results.push({
              id: val.id,
              name: val.name,
              size: val.size,
              type: val.type,
              createdAt: val.createdAt,
              lastAccessedAt: val.lastAccessedAt,
            });
            cursor.continue();
          } else {
            resolve(results.sort((a, b) => b.createdAt - a.createdAt));
          }
        };

        req.onerror = () => {
          reject(req.error || new Error('Failed to list videos from IndexedDB'));
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * Deletes a video from IndexedDB and revokes its session Object URL.
   */
  async deleteVideo(id: string): Promise<void> {
    if (!id) return;
    try {
      const existingUrl = activeObjectUrlMap.get(id);
      if (existingUrl) {
        URL.revokeObjectURL(existingUrl);
        activeObjectUrlMap.delete(id);
      }

      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error(`Failed to delete video ${id}`));
      });
    } catch (e) {
      console.warn('deleteVideo failed', e);
    }
  },

  /**
   * Revoke an active session URL if needed.
   */
  revokeSessionUrl(id: string): void {
    const url = activeObjectUrlMap.get(id);
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
      activeObjectUrlMap.delete(id);
    }
  },
};
