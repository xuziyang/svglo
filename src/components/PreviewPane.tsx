import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import type { ConvertStatus } from '../hooks/useVTracer';
import { t } from '../i18n';
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from '../lib/imageInput';
import { Segmented } from './Segmented';

export type PreviewView = 'before' | 'after' | 'compare';

/** Soft thresholds for result-size warnings (UX only). */
const LARGE_SVG_BYTES = 500 * 1024;
const MANY_PATHS = 2000;

interface PreviewPaneProps {
  imageSrc: string | null;
  imageDims: { w: number; h: number } | null;
  canvasRef: RefObject<HTMLCanvasElement>;
  svgRef: RefObject<SVGSVGElement>;
  view: PreviewView;
  onViewChange: (view: PreviewView) => void;
  status: ConvertStatus;
  progress: number;
  svgString: string | null;
  pathCount: number;
  error: string | null;
  onRetry: () => void;
  onReset: () => void;
  onCancel: () => void;
  onReplaceImage: (file: File) => void;
  onDownload: () => void;
  onCopy: () => void;
  copied: boolean;
}

export function PreviewPane(props: PreviewPaneProps) {
  const {
    imageSrc,
    imageDims,
    canvasRef,
    svgRef,
    view,
    onViewChange,
    status,
    progress,
    svgString,
    pathCount,
    error,
    onRetry,
    onReset,
    onCancel,
    onReplaceImage,
    onDownload,
    onCopy,
    copied,
  } = props;

  const running = status === 'running' || status === 'loading';
  const hasResult = !!svgString;
  // Full-screen overlay only when there is nothing useful to show yet.
  const blockingProgress = running && !hasResult;
  const inlineProgress = running && hasResult;

  const viewBox = imageDims ? `0 0 ${imageDims.w} ${imageDims.h}` : undefined;
  const svgBytes = useMemo(
    () => (svgString ? new Blob([svgString]).size : 0),
    [svgString],
  );

  const vectorUrl = useMemo(() => {
    if (!svgString) return null;
    return URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml' }));
  }, [svgString]);

  useEffect(() => {
    return () => {
      if (vectorUrl) URL.revokeObjectURL(vectorUrl);
    };
  }, [vectorUrl]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [comparePos, setComparePos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const panDrag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const compareDrag = useRef(false);
  const dropDepth = useRef(0);

  // Reset view tools when the source image changes.
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setComparePos(50);
    setReplaceError(null);
  }, [imageSrc]);

  const clampZoom = (value: number) => Math.min(4, Math.max(0.5, value));

  const handleZoomIn = () => setZoom((z) => clampZoom(z * 1.25));
  const handleZoomOut = () => setZoom((z) => clampZoom(z / 1.25));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const onWheel = (event: ReactWheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => clampZoom(z * factor));
  };

  const onStagePointerDown = (event: ReactPointerEvent) => {
    if (zoom <= 1 || event.button !== 0) return;
    // Don't pan when interacting with the compare handle.
    if ((event.target as HTMLElement).closest('.compare-handle')) return;
    panDrag.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onStagePointerMove = (event: ReactPointerEvent) => {
    if (!panDrag.current) return;
    const dx = event.clientX - panDrag.current.x;
    const dy = event.clientY - panDrag.current.y;
    setPan({ x: panDrag.current.panX + dx, y: panDrag.current.panY + dy });
  };

  const onStagePointerUp = (event: ReactPointerEvent) => {
    if (!panDrag.current) return;
    panDrag.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
  };

  const updateCompareFromClientX = useCallback((clientX: number) => {
    const el = compareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setComparePos(Math.min(95, Math.max(5, pct)));
  }, []);

  const onComparePointerDown = (event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    compareDrag.current = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    updateCompareFromClientX(event.clientX);
  };

  const onComparePointerMove = (event: ReactPointerEvent) => {
    if (!compareDrag.current) return;
    updateCompareFromClientX(event.clientX);
  };

  const onComparePointerUp = (event: ReactPointerEvent) => {
    if (!compareDrag.current) return;
    compareDrag.current = false;
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
  };

  const acceptReplace = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const result = await validateImageFile(file);
      if (!result.ok) {
        const key =
          result.error === 'unsupported'
            ? 'dropzone.unsupported'
            : result.error === 'tooLarge'
              ? 'dropzone.tooLarge'
              : result.error === 'tooManyPixels'
                ? 'dropzone.tooManyPixels'
                : 'dropzone.unreadable';
        setReplaceError(t(key));
        return;
      }
      setReplaceError(null);
      onReplaceImage(file);
    },
    [onReplaceImage],
  );

  // Paste-to-replace while the workspace is open.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, [contenteditable="true"]')) return;
      for (const item of event.clipboardData?.items ?? []) {
        if (!item.type.startsWith('image/')) continue;
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          void acceptReplace([file]);
          return;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [acceptReplace]);

  const largeFile = hasResult && svgBytes >= LARGE_SVG_BYTES;
  const manyPaths = hasResult && pathCount >= MANY_PATHS;
  const showWarning = largeFile || manyPaths;

  const progressLabel =
    status === 'loading' || (status === 'running' && progress < 1 && !hasResult)
      ? t('preview.loadingEngine')
      : `${t('preview.vectorizing')} ${Math.round(progress)}%`;

  return (
    <section className="preview">
      <div className="preview-toolbar">
        <Segmented
          value={view}
          options={[
            { value: 'before', label: t('preview.original') },
            { value: 'after', label: t('preview.vector') },
            { value: 'compare', label: t('preview.compare') },
          ]}
          onChange={(v) => onViewChange(v as PreviewView)}
        />
        <div className="preview-actions">
          <div className="zoom-controls" role="group" aria-label={t('preview.zoom')}>
            <button type="button" className="btn btn-ghost btn-icon" onClick={handleZoomOut} title={t('preview.zoomOut')}>
              −
            </button>
            <button type="button" className="btn btn-ghost btn-icon zoom-label" onClick={handleZoomReset} title={t('preview.zoomReset')}>
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" className="btn btn-ghost btn-icon" onClick={handleZoomIn} title={t('preview.zoomIn')}>
              +
            </button>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => replaceInputRef.current?.click()}
            title={t('preview.replaceTitle')}
          >
            {t('preview.replace')}
          </button>
          <button
            className="btn btn-ghost"
            onClick={onCopy}
            disabled={!svgString}
            title={t('preview.copyTitle')}
          >
            {copied ? t('preview.copied') : t('preview.copy')}
          </button>
          <button
            className="btn btn-primary"
            onClick={onDownload}
            disabled={!svgString}
          >
            {t('preview.download')}
          </button>
        </div>
      </div>

      <input
        ref={replaceInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        hidden
        onChange={(e) => {
          void acceptReplace(e.target.files);
          e.currentTarget.value = '';
        }}
      />

      <div
        ref={stageRef}
        className={`preview-stage ${dragging ? 'is-drop-target' : ''} ${zoom > 1 ? 'is-zoomed' : ''}`}
        onWheel={onWheel}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerUp}
        onPointerCancel={onStagePointerUp}
        onDragEnter={(e) => {
          e.preventDefault();
          dropDepth.current++;
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dropDepth.current--;
          if (dropDepth.current <= 0) {
            dropDepth.current = 0;
            setDragging(false);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          dropDepth.current = 0;
          setDragging(false);
          void acceptReplace(e.dataTransfer.files);
        }}
      >
        {/* Working canvas + svg: wasm owns these. Always mounted, visually hidden. */}
        <canvas ref={canvasRef} id="vt-canvas" className="vt-work" aria-hidden />
        <svg
          ref={svgRef}
          id="vt-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={viewBox}
          width={imageDims?.w}
          height={imageDims?.h}
          className="vt-work"
          aria-hidden
        />

        <div
          className="preview-viewport"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {view === 'before' && imageSrc && (
            <div className="pane pane-before">
              <img src={imageSrc} alt={t('preview.originalAlt')} className="pane-img" draggable={false} />
            </div>
          )}

          {view === 'after' && (
            <div className="pane pane-after">
              {vectorUrl ? (
                <img
                  src={vectorUrl}
                  alt={t('preview.vectorAlt')}
                  className="pane-img pane-vector"
                  draggable={false}
                />
              ) : imageSrc ? (
                <img
                  src={imageSrc}
                  alt={t('preview.originalAlt')}
                  className="pane-img pane-pending"
                  draggable={false}
                />
              ) : null}
            </div>
          )}

          {view === 'compare' && imageSrc && (
            <div
              ref={compareRef}
              className="compare-frame"
              role="img"
              aria-label={t('preview.compareAria')}
            >
              <img
                src={vectorUrl ?? imageSrc}
                alt=""
                className={`compare-base ${vectorUrl ? '' : 'pane-pending'}`}
                draggable={false}
              />
              <img
                src={imageSrc}
                alt=""
                className="compare-overlay"
                draggable={false}
                style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }}
              />
              <div
                className="compare-handle"
                style={{ left: `${comparePos}%` }}
                onPointerDown={onComparePointerDown}
                onPointerMove={onComparePointerMove}
                onPointerUp={onComparePointerUp}
                onPointerCancel={onComparePointerUp}
                role="slider"
                aria-valuemin={5}
                aria-valuemax={95}
                aria-valuenow={Math.round(comparePos)}
                aria-label={t('preview.compareHandle')}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') setComparePos((p) => Math.max(5, p - 2));
                  if (e.key === 'ArrowRight') setComparePos((p) => Math.min(95, p + 2));
                }}
              >
                <span className="compare-handle-line" />
                <span className="compare-handle-knob" aria-hidden>
                  ‹ ›
                </span>
              </div>
              <div className="compare-labels" aria-hidden>
                <span>{t('preview.original')}</span>
                <span>{t('preview.vector')}</span>
              </div>
            </div>
          )}
        </div>

        {inlineProgress && (
          <div className="preview-progress-inline" role="status" aria-live="polite">
            <div className="preview-progress-inline-row">
              <span>{progressLabel}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
                {t('preview.cancel')}
              </button>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.max(progress, 2)}%` }} />
            </div>
          </div>
        )}

        {blockingProgress && (
          <div className="preview-overlay">
            <div className="progress-card">
              <div className="progress-label">{progressLabel}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.max(progress, 2)}%` }} />
              </div>
              <button type="button" className="btn btn-ghost btn-sm progress-cancel" onClick={onCancel}>
                {t('preview.cancel')}
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="preview-overlay">
            <div className="error-card">
              <strong>{t('preview.failed')}</strong>
              <p>{error}</p>
              <p className="error-hint">{t('preview.failedHint')}</p>
              <div className="error-actions">
                <button type="button" className="btn btn-primary" onClick={onRetry}>
                  {t('preview.retry')}
                </button>
                <button type="button" className="btn btn-ghost" onClick={onReset}>
                  {t('preview.chooseAnother')}
                </button>
              </div>
            </div>
          </div>
        )}

        {dragging && (
          <div className="preview-drop-hint" aria-hidden>
            {t('preview.dropToReplace')}
          </div>
        )}

        {!imageSrc && (
          <div className="preview-empty">
            <p>{t('preview.empty')}</p>
          </div>
        )}
      </div>

      {(imageDims || replaceError || showWarning) && (
        <div className="preview-meta">
          <div className="preview-meta-row">
            {imageDims && (
              <span>
                {t('preview.size')} {imageDims.w} × {imageDims.h}px
              </span>
            )}
            {svgString && <span>SVG {(svgBytes / 1024).toFixed(1)} KB</span>}
            {svgString && pathCount > 0 && (
              <span>
                {t('preview.paths')} {pathCount.toLocaleString()}
              </span>
            )}
          </div>
          {replaceError && (
            <p className="preview-meta-error" role="alert">
              {replaceError}
            </p>
          )}
          {showWarning && (
            <p className="preview-meta-warn" role="status">
              {largeFile ? t('preview.largeResult') : t('preview.manyPaths')}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
