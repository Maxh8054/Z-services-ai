/**
 * Image cover-crop utility for PowerPoint generation.
 *
 * pptxgenjs v4.0.1 has a bug where `sizing: { type: 'cover' }` doesn't work
 * for base64 images (it uses display dimensions instead of natural image dimensions,
 * resulting in zero crop and full stretch — photos get distorted).
 *
 * This module pre-processes images using an offscreen canvas:
 * 1. Loads the base64 image to get its natural dimensions
 * 2. Normalizes EXIF orientation (so photos appear the same as in the browser)
 * 3. Draws it with "cover" behavior (scale to fill, center, crop overflow)
 * 4. Returns a new base64 string with the correct aspect ratio
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
  let img = await loadImage(base64DataUrl);

  // Normalize EXIF orientation so canvas draw matches browser display
  img = await normalizeExifOrientation(img, base64DataUrl);

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

// --- EXIF Orientation Handling ---

/**
 * Read EXIF orientation tag (0x0112) from a JPEG base64 data URL.
 * Returns 1-8, or 1 (normal) if not found / not JPEG.
 *
 * Orientation values:
 *   1 = normal, 2 = flip H, 3 = rotate 180°, 4 = flip V
 *   5 = rotate 90° CCW + flip H, 6 = rotate 90° CW
 *   7 = rotate 90° CW + flip H, 8 = rotate 90° CCW
 */
function getExifOrientation(base64DataUrl: string): number {
  const base64 = base64DataUrl.replace(/^data:image\/.*?;base64,/, '');
  let bytes: Uint8Array;
  try {
    const binary = atob(base64);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } catch {
    return 1;
  }

  // Must be JPEG (FF D8)
  if (bytes.length < 4 || bytes[0] !== 0xFF || bytes[1] !== 0xD8) return 1;

  let offset = 2;
  while (offset < bytes.length - 2) {
    if (bytes[offset] !== 0xFF) break;
    const marker = bytes[offset + 1];
    // Skip padding markers
    if (marker === 0x00 || marker === 0xD8) { offset += 2; continue; }
    if (marker === 0xD9 || marker === 0xDA) break; // EOI or SOS

    const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (segLen < 2) break;

    // APP1 (0xE1) contains EXIF data
    if (marker === 0xE1) {
      // Check for "Exif\0\0" header at offset+4
      if (
        offset + 10 < bytes.length &&
        bytes[offset + 4] === 0x45 && // E
        bytes[offset + 5] === 0x78 && // x
        bytes[offset + 6] === 0x69 && // i
        bytes[offset + 7] === 0x66 && // f
        bytes[offset + 8] === 0x00 &&
        bytes[offset + 9] === 0x00
      ) {
        const tiffStart = offset + 10;
        const littleEndian = bytes[tiffStart] === 0x49 && bytes[tiffStart + 1] === 0x49;

        const read16 = (o: number) =>
          littleEndian
            ? bytes[o] | (bytes[o + 1] << 8)
            : (bytes[o] << 8) | bytes[o + 1];

        // First IFD offset
        const ifdOffset = read16(tiffStart + 8);
        if (tiffStart + ifdOffset + 2 > bytes.length) return 1;

        const numEntries = read16(tiffStart + ifdOffset);

        for (let i = 0; i < numEntries; i++) {
          const entryOff = tiffStart + ifdOffset + 2 + i * 12;
          if (entryOff + 12 > bytes.length) break;

          const tag = read16(entryOff);
          if (tag === 0x0112) {
            // Orientation tag found, value is at entryOff+8
            return bytes[entryOff + 8];
          }
        }
      }
    }

    offset += 2 + segLen;
  }

  return 1;
}

/**
 * Normalize an image's EXIF orientation by redrawing it on a canvas
 * with the correct rotation. Returns a new HTMLImageElement with
 * the orientation baked into the pixel data.
 *
 * This ensures canvas drawImage produces the same result as the
 * browser's <img> display (which auto-applies EXIF orientation).
 */
async function normalizeExifOrientation(
  img: HTMLImageElement,
  base64DataUrl: string
): Promise<HTMLImageElement> {
  const orientation = getExifOrientation(base64DataUrl);
  if (orientation <= 1 || orientation > 8) return img; // No rotation needed

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img;

  ctx.save();
  switch (orientation) {
    case 2: // Flip horizontal
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      break;
    case 3: // Rotate 180°
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
      break;
    case 4: // Flip vertical
      ctx.translate(0, h);
      ctx.scale(1, -1);
      break;
    case 5: // Rotate 90° CCW + flip horizontal
      ctx.translate(w, 0);
      ctx.rotate(-Math.PI / 2);
      ctx.scale(-1, 1);
      break;
    case 6: // Rotate 90° CW (most common for portrait phone photos)
      ctx.translate(w, 0);
      ctx.rotate(Math.PI / 2);
      break;
    case 7: // Rotate 90° CW + flip horizontal
      ctx.translate(w, h);
      ctx.rotate(Math.PI / 2);
      ctx.scale(-1, 1);
      break;
    case 8: // Rotate 90° CCW
      ctx.translate(0, h);
      ctx.rotate(-Math.PI / 2);
      break;
  }

  ctx.drawImage(img, 0, 0);
  ctx.restore();

  // Convert the normalized canvas back to an HTMLImageElement
  return loadImage(canvas.toDataURL('image/png'));
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
