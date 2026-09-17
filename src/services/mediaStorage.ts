/**
 * IndexedDB storage for local video media in Space canvas.
 * Allows users to upload and persist offline/local video files (MP4, WebM, etc.)
 * across sessions, layout switches, and refreshes without localStorage quota errors.
 */

const DB_NAME = 'nexus_media_db';
const DB_VERSION = 1;
const VIDEO_STORE = 'space_videos';

interface StoredVideo {
  id: string;
  blob: Blob;
  fileName: string;
  fileType: string;
  size: number;
  updatedAt: number;
}

// In-memory active object URLs cache to reuse URLs and avoid memory leaks
const objectUrlCache = new Map<string, string>();

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        db.createObjectStore(VIDEO_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open media database'));
    };
  });
}

export const mediaStorage = {
  /**
   * Store a local video File or Blob in IndexedDB.
   * Returns the generated/provided videoId and an active Object URL for immediate playback.
   */
  async saveLocalVideo(file: File | Blob, customId?: string, fileName?: string): Promise<{ id: string; url: string; size: number }> {
    const id = customId || `vid_file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const resolvedName = fileName || (file instanceof File ? file.name : `local_video_${id.slice(-4)}.mp4`);
    const fileType = file.type || 'video/mp4';
    const size = file.size;

    const db = await openMediaDB();
    const record: StoredVideo = {
      id,
      blob: file,
      fileName: resolvedName,
      fileType,
      size,
      updatedAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE, 'readwrite');
      const store = tx.objectStore(VIDEO_STORE);
      const req = store.put(record);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Revoke existing object URL if cached
    if (objectUrlCache.has(id)) {
      try {
        URL.revokeObjectURL(objectUrlCache.get(id)!);
      } catch {}
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlCache.set(id, objectUrl);

    return { id, url: objectUrl, size };
  },

  /**
   * Retrieve the video Blob from IndexedDB
   */
  async getLocalVideoBlob(id: string): Promise<Blob | null> {
    try {
      const db = await openMediaDB();
      return new Promise<Blob | null>((resolve) => {
        const tx = db.transaction(VIDEO_STORE, 'readonly');
        const store = tx.objectStore(VIDEO_STORE);
        const req = store.get(id);

        req.onsuccess = () => {
          const result = req.result as StoredVideo | undefined;
          if (result && result.blob) {
            resolve(result.blob);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => {
          resolve(null);
        };
      });
    } catch {
      return null;
    }
  },

  /**
   * Get or recreate a playable Object URL for a stored local video ID
   */
  async getLocalVideoUrl(id: string): Promise<string | null> {
    if (objectUrlCache.has(id)) {
      return objectUrlCache.get(id)!;
    }

    const blob = await this.getLocalVideoBlob(id);
    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    objectUrlCache.set(id, url);
    return url;
  },

  /**
   * Delete a stored video by ID
   */
  async deleteLocalVideo(id: string): Promise<void> {
    if (objectUrlCache.has(id)) {
      try {
        URL.revokeObjectURL(objectUrlCache.get(id)!);
      } catch {}
      objectUrlCache.delete(id);
    }

    try {
      const db = await openMediaDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(VIDEO_STORE, 'readwrite');
        const store = tx.objectStore(VIDEO_STORE);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {}
  },
};
