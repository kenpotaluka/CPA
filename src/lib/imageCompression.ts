/**
 * Image compression utility for Supabase storage
 * Compresses images to WEBP format with max 1080p resolution and <1MB size
 */

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const INITIAL_QUALITY = 0.8;

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
}

/**
 * Compress an image file to meet size requirements
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // If file is already small enough and is a supported format, return as-is
  if (originalSize <= MAX_FILE_SIZE && isWebPOrSupported(file)) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false
    };
  }

  // Load image
  const img = await loadImage(file);
  
  // Calculate new dimensions
  const { width, height } = calculateDimensions(img.width, img.height);
  
  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  ctx.drawImage(img, 0, 0, width, height);
  
  // Try to compress with decreasing quality until size is acceptable
  let quality = INITIAL_QUALITY;
  let blob: Blob | null = null;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    blob = await canvasToBlob(canvas, quality);
    
    if (blob.size <= MAX_FILE_SIZE || quality <= 0.3) {
      break;
    }
    
    quality -= 0.1;
    attempts++;
  }
  
  if (!blob) {
    throw new Error('Failed to compress image');
  }
  
  // Create new file with sanitized name
  const sanitizedName = sanitizeFileName(file.name);
  const compressedFile = new File([blob], sanitizedName, {
    type: 'image/webp',
    lastModified: Date.now()
  });
  
  return {
    file: compressedFile,
    originalSize,
    compressedSize: compressedFile.size,
    wasCompressed: true
  };
}

/**
 * Load image from file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(width: number, height: number): { width: number; height: number } {
  if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
    return { width, height };
  }
  
  const aspectRatio = width / height;
  
  if (width > height) {
    return {
      width: Math.min(width, MAX_WIDTH),
      height: Math.min(width, MAX_WIDTH) / aspectRatio
    };
  } else {
    return {
      width: Math.min(height, MAX_HEIGHT) * aspectRatio,
      height: Math.min(height, MAX_HEIGHT)
    };
  }
}

/**
 * Convert canvas to blob
 */
function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Check if file is already in a supported format
 */
function isWebPOrSupported(file: File): boolean {
  const supportedTypes = ['image/webp', 'image/jpeg', 'image/png', 'image/gif'];
  return supportedTypes.includes(file.type);
}

/**
 * Sanitize file name to contain only English letters and numbers
 */
export function sanitizeFileName(fileName: string): string {
  const extension = fileName.split('.').pop() || 'webp';
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  
  // Replace non-alphanumeric characters with underscores
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // If name is empty after sanitization, use timestamp
  const finalName = sanitized || `image_${Date.now()}`;
  
  return `${finalName}.${extension === 'webp' ? 'webp' : 'webp'}`;
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, GIF, WEBP, or AVIF images.'
    };
  }
  
  // Check if file is too large (before compression)
  const maxInitialSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxInitialSize) {
    return {
      valid: false,
      error: 'File is too large. Maximum size is 10MB.'
    };
  }
  
  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
