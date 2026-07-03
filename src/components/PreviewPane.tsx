import type { RefObject } from 'react';
import type { ConvertStatus } from '../hooks/useVTracer';

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
    onDownload,
    onCopy,
    copied,
  } = props;

  const running = status === 'running';
  const viewBox = imageDims ? `0 0 ${imageDims.w} ${imageDims.h}` : undefined;

  return (
    <section className="preview">
      <div className="preview-toolbar">
        <div className="segmented">
          {(['before', 'after', 'compare'] as const).map((v) => (
            <button
              key={v}
              className={`seg-btn ${view === v ? 'is-active' : ''}`}
              onClick={() => onViewChange(v)}
            >
              {v === 'before' ? '原图' : v === 'after' ? '矢量' : '对比'}
            </button>
          ))}
        </div>
        <div className="preview-actions">
          <button
            className="btn btn-ghost"
            onClick={onCopy}
            disabled={!svgString}
            title="复制 SVG 源码到剪贴板"
          >
            {copied ? '已复制 ✓' : '复制 SVG'}
          </button>
          <button
            className="btn btn-primary"
            onClick={onDownload}
            disabled={!svgString}
          >
            下载 SVG
          </button>
        </div>
      </div>

      <div className="preview-stage">
        {/* Working canvas: wasm reads pixels from here. Always mounted, hidden. */}
        <canvas ref={canvasRef} id="vt-canvas" style={{ display: 'none' }} />

        <div className="pane pane-before" hidden={view !== 'before' && view !== 'compare'}>
          {imageSrc && <img src={imageSrc} alt="原图" className="pane-img" />}
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
                正在矢量化… {Math.round(progress)}%
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
              <strong>转换失败</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!imageSrc && (
          <div className="preview-empty">
            <p>上传图片后将在此显示对比预览。</p>
          </div>
        )}
      </div>

      {imageDims && (
        <div className="preview-meta">
          <span>
            尺寸 {imageDims.w} × {imageDims.h}px
          </span>
          {svgString && (
            <span>SVG · {(new Blob([svgString]).size / 1024).toFixed(1)} KB</span>
          )}
        </div>
      )}
    </section>
  );
}
