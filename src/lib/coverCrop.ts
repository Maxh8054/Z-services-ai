/**
 * Image cover-crop utility for PowerPoint generation.
 *
 * pptxgenjs v4.0.1 has a bug where `sizing: { type: 'cover' }` doesn't work
 * for base64 images (it uses display dimensions instead of natural image dimensions,
 * resulting in zero crop and full stretch — photos get distorted).
 *
 * This module pre-processes images using an offscreen canvas:
 * 1. Loads the base64 image to get its natural dimensions
 * 2. Draws it with "cover" behavior (scale to fill, center, crop overflow)
 * 3. Returns a new base64 string with the correct aspect ratio
 *
 * PowerPoint then displays this pre-cropped image 1:1 — no stretching.
 */

const DPI = 150; // Good balance between quality and file size
const INCHES_TO_PX = DPI; // 1 inch = 150px at 150 DPI

interface CoverCropOptions {
  /** Target width in inches */
  targetW: number;
  /** Target height in inches */
  targetH: number;
  /** Output format: 'jpeg' (default, smaller) or 'png' */
  format?: 'jpeg' | 'png';
  /** JPEG quality 0-1 (default 0.92) */
  quality?: number;
}

/**
 * Pre-process a base64 image with "cover" crop behavior.
 * Returns a Promise that resolves to a new base64 data URL.
 *
 * @param base64DataUrl - The original image as a data URL (e.g., "data:image/jpeg;base64,...")
 * @param options - Target dimensions in inches and output settings
 */
export async function coverCropImage(
  base64DataUrl: string,
  options: CoverCropOptions
): Promise<string> {
  const { targetW, targetH, format = 'jpeg', quality = 0.92 } = options;

  // Load the image
  const img = await loadImage(base64DataUrl);

  // Target canvas dimensions in pixels
  const canvasW = Math.round(targetW * INCHES_TO_PX);
  const canvasH = Math.round(targetH * INCHES_TO_PX);

  // Calculate cover crop (same logic as CSS object-fit: cover)
  const imgRatio = img.naturalHeight / img.naturalWidth;
  const boxRatio = canvasH / canvasW;

  let drawW: number, drawH: number, drawX: number, drawY: number;

  if (boxRatio > imgRatio) {
    // Box is taller than image ratio → scale by width, crop top/bottom
    drawW = canvasW;
    drawH = canvasW * imgRatio;
    drawX = 0;
    drawY = (canvasH - drawH) / 2;
  } else {
    // Box is wider than image ratio → scale by height, crop left/right
    drawH = canvasH;
    drawW = canvasH / imgRatio;
    drawX = (canvasW - drawW) / 2;
    drawY = 0;
  }

  // Draw on canvas
  const canvas = createCanvas(canvasW, canvasH);
  const ctx = canvas.getContext('2d');

  // Fill with white background (for JPEG transparency)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw the image with cover crop
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  // Export
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, quality);

  return dataUrl;
}

/**
 * Process an image that might be null.
 * Returns null if the input is null/empty.
 */
export async function maybeCoverCropImage(
  base64DataUrl: string | null,
  options: CoverCropOptions
): Promise<string | null> {
  if (!base64DataUrl) return null;
  try {
    return await coverCropImage(base64DataUrl, options);
  } catch (err) {
    console.warn('[coverCrop] Failed to process image, using original:', err);
    return base64DataUrl;
  }
}

/**
 * Process multiple images in parallel.
 */
export async function coverCropImages(
  images: Array<{ data: string | null; targetW: number; targetH: number }>,
  format?: 'jpeg' | 'png',
  quality?: number
): Promise<(string | null)[]> {
  return Promise.all(
    images.map((img) =>
      maybeCoverCropImage(img.data, {
        targetW: img.targetW,
        targetH: img.targetH,
        format,
        quality,
      })
    )
  );
}

// --- Helpers ---

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function createCanvas(w: number, h: number): HTMLCanvasElement {
  // Use OffscreenCanvas if available, fallback to regular canvas
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(w, h) as unknown as HTMLCanvasElement;
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

export interface ImageInfo {
  width: number;
  height: number;
  isPortrait: boolean;
}

/**
 * Load a base64 image and return its natural dimensions + orientation.
 */
export async function getImageInfo(base64DataUrl: string): Promise<ImageInfo> {
  const img = await loadImage(base64DataUrl);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    isPortrait: img.naturalHeight > img.naturalWidth,
  };
}