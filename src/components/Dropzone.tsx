import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../i18n';
import { ACCEPTED_IMAGE_TYPES, imageErrorMessage, imageFromPasteEvent, validateImageFile } from '../lib/imageInput';

/** How a file reached the dropzone; reported with the `image_uploaded` event. */
export type ImageSource = 'picker' | 'drop' | 'paste';

interface DropzoneProps {
  onImage: (file: File, source: ImageSource) => void;
  onExample: () => void;
}

export function Dropzone({ onImage, onExample }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const depthRef = useRef(0);
  const errorId = 'dropzone-error';

  const handleFiles = useCallback(
    async (files: FileList | File[] | null, source: ImageSource) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const result = await validateImageFile(file);
      if (!result.ok) {
        setValidationError(imageErrorMessage(result.error, t));
        return;
      }
      setValidationError(null);
      onImage(file, source);
    },
    [onImage],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      depthRef.current = 0;
      setDragging(false);
      void handleFiles(e.dataTransfer.files, 'drop');
    },
    [handleFiles],
  );

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = imageFromPasteEvent(event);
      if (!file) return;
      event.preventDefault();
      void handleFiles([file], 'paste');
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
          void handleFiles(e.target.files, 'picker');
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
