/**
 * Utility to optimize and scale down image files from local disk
 * before storing them in local storage.
 */
export async function optimizeLocalImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
): Promise<{ dataUrl: string; name: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Failed to read file'));
        return;
      }

      // If it's SVG, return data URL directly
      if (file.type === 'image/svg+xml') {
        resolve({ dataUrl, name: file.name, size: file.size });
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect ratio preserving scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // fallback to original dataUrl
          resolve({ dataUrl, name: file.name, size: file.size });
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        try {
          const optimized = canvas.toDataURL('image/webp', quality);
          resolve({ dataUrl: optimized, name: file.name, size: Math.round(optimized.length * 0.75) });
        } catch {
          try {
            const optimized = canvas.toDataURL('image/jpeg', quality);
            resolve({ dataUrl: optimized, name: file.name, size: Math.round(optimized.length * 0.75) });
          } catch {
            resolve({ dataUrl, name: file.name, size: file.size });
          }
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to parse image from file'));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      reject(new Error('FileReader error while reading file'));
    };

    reader.readAsDataURL(file);
  });
}
