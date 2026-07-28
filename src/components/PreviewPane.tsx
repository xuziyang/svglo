import { useEffect, useMemo, useRef, type RefObject } from 'react';
import type { ConvertStatus } from '../hooks/useVTracer';
import { t } from '../i18n';
import { Segmented } from './Segmented';

export type PreviewView = 'before' | 'after' | 'compare';

interface PreviewPaneProps {
  imageSrc: string | null;
  imageDims: { w: number; h: number } | null;
  canvasRef: RefObject<HTMLCanvasElement>;
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

/**
 * Pull the root <svg> element out of a full SVG document string so it can be
 * inlined into the page. Strips the XML declaration / comments the 1.0 writer
 * prefixes, and stamps id/class for styling + e2e.
 */
function prepareInlineSvg(
  svgString: string,
  className: string,
  id: string,
): string | null {
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return null;
  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== 'svg') return null;
  root.setAttribute('id', id);
  root.setAttribute('class', className);
  // 1.0 writer emits width/height but not viewBox; add one so CSS can scale
  // the preview while keeping the intrinsic aspect ratio.
  if (!root.hasAttribute('viewBox')) {
    const w = root.getAttribute('width');
    const h = root.getAttribute('height');
    if (w && h) root.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  return new XMLSerializer().serializeToString(root);
}

export function PreviewPane(props: PreviewPaneProps) {
  const {
    imageSrc,
    imageDims,
    canvasRef,
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

  const running = status === 'running';
  const hostRef = useRef<HTMLDivElement>(null);
  const svgBytes = useMemo(
    () => (svgString ? new Blob([svgString]).size : 0),
    [svgString],
  );

  // Mount the 1.0 SVG string into the preview host. React does not own the
  // children — we replace the host contents whenever svgString changes.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!svgString) {
      host.replaceChildren();
      return;
    }
    const markup = prepareInlineSvg(svgString, 'pane-svg', 'vt-svg');
    if (!markup) {
      host.replaceChildren();
      return;
    }
    host.innerHTML = markup;
  }, [svgString]);

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
        {/* Working canvas: source of RGBA pixels for the 1.0 converter. */}
        <canvas ref={canvasRef} id="vt-canvas" style={{ display: 'none' }} />

        <div className="pane pane-before" hidden={view !== 'before' && view !== 'compare'}>
          {imageSrc && <img src={imageSrc} alt={t('preview.originalAlt')} className="pane-img" />}
        </div>

        <div className="pane pane-after" hidden={view !== 'after' && view !== 'compare'}>
          {/*
            Host for the SVG string returned by convertPixels. Children are
            written imperatively — do not put React-managed nodes here.
          */}
          <div
            ref={hostRef}
            className="pane-svg-host"
            data-empty={!svgString && !running ? 'true' : undefined}
            style={
              imageDims
                ? { aspectRatio: `${imageDims.w} / ${imageDims.h}`, width: '100%' }
                : undefined
            }
          />
        </div>

        {running && (
          <div className="preview-overlay">
            <div className="progress-card">
              <div className="progress-label">{t('preview.vectorizing')}</div>
              <div className="progress-bar progress-bar-indeterminate">
                <div className="progress-fill" style={{ width: `${Math.max(progress, 24)}%` }} />
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
