import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '../i18n/LocaleContext';

interface DropzoneProps {
  onImage: (file: File) => void;
  onExample: () => void;
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp', 'image/x-ms-bmp'];
const ACCEPTED_EXTENSIONS = /\.(png|jpe?g|webp|gif|bmp)$/i;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;

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

export function Dropzone({ onImage, onExample }: DropzoneProps) {
  const t = useT();
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const depthRef = useRef(0);
  const errorId = 'dropzone-error';

  const handleFiles = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const supported = ACCEPTED.includes(file.type) || ACCEPTED_EXTENSIONS.test(file.name);
      if (!supported) {
        setValidationError(t('dropzone.unsupported'));
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setValidationError(t('dropzone.tooLarge'));
        return;
      }
      try {
        const { width, height } = await readImageDimensions(file);
        if (width * height > MAX_IMAGE_PIXELS) {
          setValidationError(t('dropzone.tooManyPixels'));
          return;
        }
      } catch {
        setValidationError(t('dropzone.unreadable'));
        return;
      }
      setValidationError(null);
      onImage(file);
    },
    [onImage, t],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      depthRef.current = 0;
      setDragging(false);
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, [contenteditable="true"]')) return;
      for (const item of event.clipboardData?.items ?? []) {
        if (!item.type.startsWith('image/')) continue;
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          void handleFiles([file]);
          return;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleFiles]);

  return (
    <div
      className={`dropzone ${dragging ? 'is-dragging' : ''}`}
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        inputRef.current?.click();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        depthRef.current++;
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        depthRef.current--;
        if (depthRef.current <= 0) setDragging(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      role="button"
      aria-label={t('dropzone.aria')}
      aria-describedby={validationError ? errorId : undefined}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        hidden
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.currentTarget.value = '';
        }}
      />
      <div className="dropzone-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
        </svg>
      </div>
      <h2>{t('dropzone.title')}</h2>
      <p>{t('dropzone.formats')}</p>
      <p className="dropzone-hint">{t('dropzone.hint')}</p>
      {validationError && (
        <p className="dropzone-error" id={errorId} role="alert">
          {validationError}
        </p>
      )}
      <div className="dropzone-example">
        <span>{t('dropzone.tryExample')}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setValidationError(null);
            onExample();
          }}
        >
          {t('dropzone.exampleName')}
        </button>
      </div>
    </div>
  );
}
