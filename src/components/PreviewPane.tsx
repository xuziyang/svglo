import { useMemo, type RefObject } from 'react';
import type { ConvertStatus } from '../hooks/useVTracer';
import { useT } from '../i18n/LocaleContext';
import { Segmented } from './Segmented';

export type PreviewView = 'before' | 'after' | 'compare';

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
  error: string | null;
  onRetry: () => void;
  onReset: () => void;
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
    error,
    onRetry,
    onReset,
    onDownload,
    onCopy,
    copied,
  } = props;

  const t = useT();
  const running = status === 'running';
  const viewBox = imageDims ? `0 0 ${imageDims.w} ${imageDims.h}` : undefined;
  const svgBytes = useMemo(
    () => (svgString ? new Blob([svgString]).size : 0),
    [svgString],
  );

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

      <div className="preview-stage">
        {/* Working canvas: wasm reads pixels from here. Always mounted, hidden. */}
        <canvas ref={canvasRef} id="vt-canvas" style={{ display: 'none' }} />

        <div className="pane pane-before" hidden={view !== 'before' && view !== 'compare'}>
          {imageSrc && <img src={imageSrc} alt={t('preview.originalAlt')} className="pane-img" />}
        </div>

        <div className="pane pane-after" hidden={view !== 'after' && view !== 'compare'}>
          {/*
            This SVG is filled imperatively by the wasm converter (paths are
            added via the DOM, NOT by React). Never render children here —
            React must not reconcile the wasm-owned children.
          */}
          <svg
            ref={svgRef}
            id="vt-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            width={imageDims?.w}
            height={imageDims?.h}
            className="pane-svg"
          />
        </div>

        {running && (
          <div className="preview-overlay">
            <div className="progress-card">
              <div className="progress-label">
                {t('preview.vectorizing')} {Math.round(progress)}%
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
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

        {!imageSrc && (
          <div className="preview-empty">
            <p>{t('preview.empty')}</p>
          </div>
        )}
      </div>

      {imageDims && (
        <div className="preview-meta">
          <span>
            {t('preview.size')} {imageDims.w} × {imageDims.h}px
          </span>
          {svgString && (
            <span>SVG · {(svgBytes / 1024).toFixed(1)} KB</span>
          )}
        </div>
      )}
    </section>
  );
}
