/**
 * Universal Client-Side Image Compressor
 * Converts any image (even 4K / 20MB phone photos) into an optimized, high-quality, lightweight Base64 string (~50KB-120KB)
 * Prevents localStorage QuotaExceededError and ensures instant sync with Google Sheets & Server
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function compressImage(
  file: File | Blob,
  maxWidthOrOptions?: number | CompressImageOptions,
  maxHeight?: number,
  quality?: number
): Promise<string> {
  let finalMaxWidth = 1000;
  let finalMaxHeight = 1000;
  let finalQuality = 0.82;

  if (typeof maxWidthOrOptions === 'object' && maxWidthOrOptions !== null) {
    if (maxWidthOrOptions.maxWidth !== undefined) finalMaxWidth = maxWidthOrOptions.maxWidth;
    if (maxWidthOrOptions.maxHeight !== undefined) finalMaxHeight = maxWidthOrOptions.maxHeight;
    if (maxWidthOrOptions.quality !== undefined) finalQuality = maxWidthOrOptions.quality;
  } else if (typeof maxWidthOrOptions === 'number') {
    finalMaxWidth = maxWidthOrOptions;
    if (maxHeight !== undefined) finalMaxHeight = maxHeight;
    if (quality !== undefined) finalQuality = quality;
  }

  return new Promise((resolve, reject) => {
    // If not an image, try reading as normal data url
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > finalMaxWidth) {
            height = Math.round((height * finalMaxWidth) / width);
            width = finalMaxWidth;
          }
        } else {
          if (height > finalMaxHeight) {
            width = Math.round((width * finalMaxHeight) / height);
            height = finalMaxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original
          resolve(e.target?.result as string);
          return;
        }

        // Draw image smoothly with high quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG data URL
        const compressedBase64 = canvas.toDataURL('image/jpeg', finalQuality);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        // Fallback to raw data url if canvas fails
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
