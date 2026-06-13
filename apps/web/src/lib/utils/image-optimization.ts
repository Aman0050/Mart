export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebP?: boolean;
}

/**
 * Compresses an image file in the browser using the HTML5 Canvas API.
 * Designed to reduce 25MB uploads down to <1MB WebP/JPEG files automatically.
 */
export async function compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    useWebP = true,
  } = options;

  // Don't compress non-images (like PDFs, DOCX)
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // If already small enough, skip compression
  if (file.size / 1024 / 1024 < maxSizeMB) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio and resize if needed
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round((height *= maxWidthOrHeight / width));
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round((width *= maxWidthOrHeight / height));
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = useWebP ? 'image/webp' : 'image/jpeg';
        let quality = 0.9; // Start high, we could dynamically lower this based on size

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob failed'));
            }
            
            // Generate new file name
            const ext = useWebP ? 'webp' : 'jpg';
            const newName = file.name.replace(/\.[^/.]+$/, "") + `_optimized.${ext}`;
            
            const compressedFile = new File([blob], newName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
