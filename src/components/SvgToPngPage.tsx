import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  formatFileSize,
  MAX_OUTPUT_EDGE,
  parseSvg,
  readSvg,
  type SvgDocument,
} from '../lib/svgRaster';
import { Footer } from './Footer';
import { Header } from './Header';
import { RelatedTools } from './RelatedTools';
import { SvgToPngArticle } from './SvgToPngArticle';

type BackgroundMode = 'transparent' | 'white' | 'dark' | 'custom';

function PngIcon() {
  return (
    <svg viewBox="0 0 54 54" width="54" height="54" fill="none" aria-hidden>
      <path d="M5 5h12v12H5zM17 17h12v12H17z" fill="currentColor" opacity=".12" />
      <path d="M17 5h12v12H17zM5 17h12v12H5z" fill="currentColor" opacity=".24" />
      <path d="M13 34h24l-8-10-5 6-4-4-7 8Z" fill="currentColor" />
      <circle cx="18" cy="22" r="3" fill="currentColor" />
      <path d="M35 43h14M44 38l5 5-5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function pngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('PNG unavailable')),
      'image/png',
    );
  });
}

export function SvgToPngPage() {
  const [svg, setSvg] = useState<SvgDocument | null>(null);
  const [outputWidth, setOutputWidth] = useState(1600);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('transparent');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [ready, setReady] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number>();
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderIdRef = useRef(0);
  const estimateIdRef = useRef(0);

  const outputHeight = useMemo(
    () => svg ? Math.max(1, Math.round(outputWidth * (svg.height / svg.width))) : 0,
    [outputWidth, svg],
  );
  const background = backgroundMode === 'transparent'
    ? null
    : backgroundMode === 'white'
      ? '#ffffff'
      : backgroundMode === 'dark'
        ? '#171b26'
        : customColor;

  const loadFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    try {
      const next = await readSvg(file);
      setSvg(next);
      setOutputWidth(Math.min(MAX_OUTPUT_EDGE, Math.max(1, Math.round(next.width))));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'This SVG could not be opened.');
    }
  }, []);

  const loadExample = useCallback(() => {
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
      <path d="M190 116h820a70 70 0 0 1 70 70v428a70 70 0 0 1-70 70H190a70 70 0 0 1-70-70V186a70 70 0 0 1 70-70Z" fill="url(#g)"/>
      <circle cx="355" cy="350" r="125" fill="#fff" opacity=".96"/>
      <path d="m228 518 128-177 94 105 72-74 124 146H228Z" fill="#312e81"/>
      <circle cx="422" cy="287" r="38" fill="#fbbf24"/>
      <text x="780" y="368" fill="#fff" font-family="Arial,sans-serif" font-size="90" font-weight="700" text-anchor="middle">PNG</text>
      <text x="780" y="430" fill="#e0e7ff" font-family="Arial,sans-serif" font-size="25" letter-spacing="7" text-anchor="middle">LOSSLESS + CLEAR</text>
    </svg>`;
    setSvg(parseSvg(markup, 'svglo-png-example.svg'));
    setOutputWidth(1200);
    setError(null);
  }, []);

  useEffect(() => {
    document.title = 'SVG to PNG Converter – Convert SVG to PNG Online | SVGlo';
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
      'content',
      'Convert SVG to PNG online for free with SVGlo. Preserve transparency, set exact dimensions, preview the result, and download a lossless PNG without uploads.',
    );
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalOrigin = canonical ? new URL(canonical.href).origin : window.location.origin;
    const pageUrl = `${canonicalOrigin}/svg-to-png/`;
    canonical?.setAttribute('href', pageUrl);
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', pageUrl);
  }, []);

  useEffect(() => {
    if (!svg || !canvasRef.current || outputHeight > MAX_OUTPUT_EDGE) {
      setReady(false);
      return;
    }

    const id = ++renderIdRef.current;
    const canvas = canvasRef.current;
    const url = URL.createObjectURL(new Blob([svg.markup], { type: 'image/svg+xml' }));
    const image = new Image();
    setRendering(true);
    setReady(false);
    setEstimatedSize(undefined);

    image.onload = () => {
      if (id !== renderIdRef.current) return;
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        setError('Canvas is unavailable in this browser.');
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (background) {
        context.fillStyle = background;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setRendering(false);
      setReady(true);
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      if (id === renderIdRef.current) {
        setRendering(false);
        setReady(false);
        setError('This SVG uses features the browser cannot render. Try simplifying the file.');
      }
      URL.revokeObjectURL(url);
    };
    image.src = url;
    return () => {
      image.src = '';
      URL.revokeObjectURL(url);
    };
  }, [background, outputHeight, outputWidth, svg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!ready || !canvas) return;
    const id = ++estimateIdRef.current;
    void pngBlob(canvas).then((blob) => {
      if (id === estimateIdRef.current) setEstimatedSize(blob.size);
    }).catch(() => {
      if (id === estimateIdRef.current) setEstimatedSize(undefined);
    });
    return () => {
      estimateIdRef.current++;
    };
  }, [ready]);

  const download = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !svg || !ready) return;
    try {
      const blob = await pngBlob(canvas);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${svg.name}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('The PNG could not be created. Try a smaller output size.');
    }
  }, [ready, svg]);

  const reset = useCallback(() => {
    renderIdRef.current++;
    estimateIdRef.current++;
    setSvg(null);
    setReady(false);
    setEstimatedSize(undefined);
    setError(null);
  }, []);

  const invalidSize = outputWidth < 1 || outputWidth > MAX_OUTPUT_EDGE || outputHeight > MAX_OUTPUT_EDGE;

  return (
    <div className="app svg-jpg-app svg-png-app">
      <Header hasImage={!!svg} onReset={reset} currentTool="svg-to-png" />
      <main className="main svg-jpg-main">
        <section className="svg-jpg-hero">
          <div className="svg-jpg-heading">
            <span className="tool-kicker">SVG → PNG</span>
            <h1>SVG to PNG Converter <span>with transparency kept intact.</span></h1>
            <p>Convert SVG to PNG online at the exact size you need. Export clean, lossless pixels without uploading your file.</p>
          </div>

          {!svg ? (
            <div
              className={`svg-jpg-drop ${dragging ? 'is-dragging' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void loadFile(event.dataTransfer.files[0]);
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".svg,image/svg+xml"
                hidden
                onChange={(event) => {
                  void loadFile(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
              <div className="svg-jpg-drop-icon"><PngIcon /></div>
              <h2>Drop your SVG here</h2>
              <p>or click to choose a file · up to 10 MB</p>
              <button className="example-link" type="button" onClick={(event) => {
                event.stopPropagation();
                loadExample();
              }}>
                Try the transparent sample
              </button>
              {error && <p className="svg-jpg-error" role="alert">{error}</p>}
            </div>
          ) : (
            <div className="svg-jpg-workspace">
              <aside className="export-settings">
                <div className="file-chip">
                  <div className="file-type">SVG</div>
                  <div><strong>{svg.name}.svg</strong><span>{Math.round(svg.width)} × {Math.round(svg.height)}</span></div>
                  <button type="button" onClick={() => inputRef.current?.click()} aria-label="Replace SVG">Replace</button>
                  <input ref={inputRef} type="file" accept=".svg,image/svg+xml" hidden onChange={(event) => {
                    void loadFile(event.target.files?.[0]);
                    event.currentTarget.value = '';
                  }} />
                </div>

                <div className="export-field">
                  <label htmlFor="png-width">Output size</label>
                  <div className="dimension-row">
                    <div><input id="png-width" type="number" min="1" max={MAX_OUTPUT_EDGE} value={outputWidth} onChange={(event) => setOutputWidth(Number(event.target.value))} /><span>W</span></div>
                    <span className="dimension-link" aria-label="Aspect ratio locked">⌁</span>
                    <div><input type="number" value={outputHeight || ''} readOnly aria-label="Output height" /><span>H</span></div>
                  </div>
                  <p>Aspect ratio locked · maximum {MAX_OUTPUT_EDGE}px per side</p>
                </div>

                <div className="export-field">
                  <label id="png-background-label">Background</label>
                  <div className="png-background-options" role="group" aria-labelledby="png-background-label">
                    {([
                      ['transparent', 'Transparent'],
                      ['white', 'White'],
                      ['dark', 'Dark'],
                      ['custom', 'Custom'],
                    ] as const).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={backgroundMode === id ? 'is-active' : ''}
                        aria-pressed={backgroundMode === id}
                        onClick={() => setBackgroundMode(id)}
                      >
                        <i className={`background-swatch is-${id}`} style={id === 'custom' ? { background: customColor } : undefined} />
                        {label}
                      </button>
                    ))}
                  </div>
                  {backgroundMode === 'custom' && (
                    <div className="png-custom-color">
                      <input type="color" value={customColor} onChange={(event) => setCustomColor(event.target.value)} aria-label="Custom PNG background" />
                      <span>{customColor.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                <div className="png-lossless-note">
                  <strong>Lossless PNG</strong>
                  <span>No quality setting needed</span>
                </div>
                {invalidSize && <p className="svg-jpg-error" role="alert">Keep both dimensions between 1 and {MAX_OUTPUT_EDGE}px.</p>}
                {error && <p className="svg-jpg-error" role="alert">{error}</p>}
                <button className="download-jpg" type="button" disabled={!ready || rendering || invalidSize} onClick={() => void download()}>
                  {rendering ? 'Rendering preview…' : `Download PNG${estimatedSize ? ` · ${formatFileSize(estimatedSize)}` : ''}`}
                  {!rendering && <span aria-hidden>↓</span>}
                </button>
              </aside>

              <section className="jpg-preview" aria-label="PNG preview">
                <div className="jpg-preview-bar">
                  <div><span className="live-dot" /> PNG preview</div>
                  <span>{outputWidth} × {outputHeight}px</span>
                </div>
                <div className="jpg-preview-stage">
                  <canvas ref={canvasRef} aria-label="Rendered PNG preview" />
                  {rendering && <div className="jpg-rendering">Rendering…</div>}
                </div>
                <div className="jpg-preview-caption">
                  <span>{background ? <>Background <i style={{ background }} /> {background.toUpperCase()}</> : 'Transparency preserved'}</span>
                  <span>Lossless · {formatFileSize(estimatedSize)}</span>
                </div>
              </section>
            </div>
          )}
        </section>

        <section className="svg-jpg-explainer">
          <div><span>01</span><h2>Choose an SVG</h2><p>Drop in a logo, icon, illustration, or exported vector file.</p></div>
          <div><span>02</span><h2>Convert SVG to PNG</h2><p>Choose exact dimensions and keep transparency or add a background.</p></div>
          <div><span>03</span><h2>Download the PNG</h2><p>Save a lossless pixel image ready for websites, apps, and documents.</p></div>
        </section>
        <SvgToPngArticle />
        <RelatedTools current="svg-to-png" />
      </main>
      <Footer />
    </div>
  );
}
