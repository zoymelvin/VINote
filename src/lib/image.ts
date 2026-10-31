export interface ImageDimensions {
  width: number;
  height: number;
}

export const MAX_SOURCE_SIZE = 15 * 1024 * 1024; // 15 MB
export const MAX_IMAGES_PER_NOTE = 30;
export const MAX_LONG_EDGE = 1600;
export const JPEG_QUALITY = 0.85;

export function calculateDimensions(
  srcWidth: number,
  srcHeight: number,
  maxLongEdge: number = MAX_LONG_EDGE
): ImageDimensions {
  if (srcWidth <= 0 || srcHeight <= 0) {
    return { width: 0, height: 0 };
  }
  const longEdge = Math.max(srcWidth, srcHeight);
  if (longEdge <= maxLongEdge) {
    return { width: srcWidth, height: srcHeight };
  }
  const scale = maxLongEdge / longEdge;
  return {
    width: Math.round(srcWidth * scale),
    height: Math.round(srcHeight * scale),
  };
}

export function shouldPreservePng(mime: string): boolean {
  return mime === "image/png";
}

export function validateSourceSize(size: number): boolean {
  return size <= MAX_SOURCE_SIZE;
}

export function validateImageCount(count: number): boolean {
  return count < MAX_IMAGES_PER_NOTE;
}
