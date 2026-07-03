import { useCallback, useRef, useState } from 'react';

interface DropzoneProps {
  onImage: (file: File) => void;
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'];

export function Dropzone({ onImage }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const depthRef = useRef(0);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!ACCEPTED.includes(file.type)) {
        alert('暂不支持该图片格式，请使用 PNG / JPG / WebP / GIF / BMP。');
        return;
      }
      onImage(file);
    },
    [onImage],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      depthRef.current = 0;
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            onImage(file);
            e.preventDefault();
            return;
          }
        }
      }
    },
    [onImage],
  );

  return (
    <div
      className={`dropzone ${dragging ? 'is-dragging' : ''}`}
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
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
      onPaste={onPaste}
      role="button"
      aria-label="上传图片"
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="dropzone-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
        </svg>
      </div>
      <h2>拖拽图片到此处，或点击选择文件</h2>
      <p>支持 PNG / JPG / WebP / GIF / BMP · 也可直接 Ctrl+V 粘贴</p>
      <p className="dropzone-hint">所有处理在你的浏览器本地完成，图片不会上传到任何服务器。</p>
    </div>
  );
}
