/** Shared raster-image validation for the dropzone and in-workspace replace. */

export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/x-ms-bmp',
] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|bmp)$/i;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;

export type ImageValidationError =
  | 'unsupported'
  | 'tooLarge'
  | 'tooManyPixels'
  | 'unreadable';

export type ImageValidationResult =
  | { ok: true; width: number; height: number }
  | { ok: false; error: ImageValidationError };

function readImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unreadable image'));
    };
    image.src = url;
  });
}

export function isAcceptedImageFile(file: File): boolean {
  return (
    (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)
    || ACCEPTED_IMAGE_EXTENSIONS.test(file.name)
  );
}

export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (!isAcceptedImageFile(file)) {
    return { ok: false, error: 'unsupported' };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: 'tooLarge' };
  }
  try {
    const { width, height } = await readImageDimensions(file);
    if (width * height > MAX_IMAGE_PIXELS) {
      return { ok: false, error: 'tooManyPixels' };
    }
    return { ok: true, width, height };
  } catch {
    return { ok: false, error: 'unreadable' };
  }
}
