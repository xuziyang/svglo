/** Shared raster-image validation for the dropzone and in-workspace replace. */

import type { MessageKey } from '../i18n/types';

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

/** Translation key for each rejection reason; both image pickers render these. */
const ERROR_MESSAGE_KEYS: Record<ImageValidationError, MessageKey> = {
  unsupported: 'dropzone.unsupported',
  tooLarge: 'dropzone.tooLarge',
  tooManyPixels: 'dropzone.tooManyPixels',
  unreadable: 'dropzone.unreadable',
};

/** Localized message for a rejected file. */
export function imageErrorMessage(
  error: ImageValidationError,
  translate: (key: MessageKey) => string,
): string {
  return translate(ERROR_MESSAGE_KEYS[error]);
}

/**
 * Find the image file a paste event carries, ignoring pastes aimed at text
 * fields. Returns null when the clipboard holds no image, in which case the
 * event should be left alone.
 */
export function imageFromPasteEvent(event: ClipboardEvent): File | null {
  const target = event.target as HTMLElement | null;
  if (target?.matches('input, textarea, [contenteditable="true"]')) return null;
  for (const item of event.clipboardData?.items ?? []) {
    if (!item.type.startsWith('image/')) continue;
    const file = item.getAsFile();
    if (file) return file;
  }
  return null;
}

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
