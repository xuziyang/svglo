import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../i18n';
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from '../lib/imageInput';

interface DropzoneProps {
  onImage: (file: File) => void;
  onExample: () => void;
}

const ERROR_COPY = {
  unsupported: 'dropzone.unsupported',
  tooLarge: 'dropzone.tooLarge',
  tooManyPixels: 'dropzone.tooManyPixels',
  unreadable: 'dropzone.unreadable',
} as const;

export function Dropzone({ onImage, onExample }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const depthRef = useRef(0);
  const errorId = 'dropzone-error';

  const handleFiles = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const result = await validateImageFile(file);
      if (!result.ok) {
        setValidationError(t(ERROR_COPY[result.error]));
        return;
      }
      setValidationError(null);
      onImage(file);
    },
    [onImage],
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
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
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
