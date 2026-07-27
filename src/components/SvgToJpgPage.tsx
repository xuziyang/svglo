import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { SvgToJpgArticle } from './SvgToJpgArticle';
import { RelatedTools } from './RelatedTools';
import {
  formatFileSize,
  MAX_OUTPUT_EDGE,
  parseSvg,
  readSvg,
  type SvgDocument,
} from '../lib/svgRaster';
const QUALITY_OPTIONS = [
  { id: 'compact', label: 'Small file', value: 0.78 },
  { id: 'balanced', label: 'Balanced', value: 0.9 },
  { id: 'best', label: 'Best quality', value: 0.96 },
] as const;

type QualityMode = (typeof QUALITY_OPTIONS)[number]['id'];
type EstimatedSizes = Partial<Record<QualityMode, number>>;

function estimateJpgSize(canvas: HTMLCanvasElement, quality: number): Promise<number> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob.size) : reject(new Error('JPG size unavailable')),
      'image/jpeg',
      quality,
    );
  });
}

function OutputIcon() {
  return (
    <svg viewBox="0 0 54 54" width="54" height="54" fill="none" aria-hidden>
      <rect x="4" y="4" width="35" height="35" rx="8" fill="currentColor" opacity=".1" />
      <path d="M13 30 21 20l6 7 4-4 8 10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="15" r="3" fill="currentColor" />
      <path d="M35 43h14M44 38l5 5-5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SvgToJpgPage() {
  const [svg, setSvg] = useState<SvgDocument | null>(null);
  const [outputWidth, setOutputWidth] = useState(1600);
  const [qualityMode, setQualityMode] = useState<QualityMode>('balanced');
  const [background, setBackground] = useState('#ffffff');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [ready, setReady] = useState(false);
  const [estimatedSizes, setEstimatedSizes] = useState<EstimatedSizes>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderIdRef = useRef(0);
  const estimateIdRef = useRef(0);

  const outputHeight = useMemo(
    () => svg ? Math.max(1, Math.round(outputWidth * (svg.height / svg.width))) : 0,
    [outputWidth, svg],
  );
  const quality = QUALITY_OPTIONS.find((option) => option.id === qualityMode) ?? QUALITY_OPTIONS[1];

  const loadFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    try {
      const next = await readSvg(file);
      const naturalWidth = Math.round(next.width);
      setSvg(next);
      setOutputWidth(Math.min(MAX_OUTPUT_EDGE, Math.max(1, naturalWidth)));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'This SVG could not be opened.');
    }
  }, []);

  const loadExample = useCallback(() => {
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
      <rect x="90" y="90" width="1020" height="620" rx="76" fill="url(#g)"/>
      <circle cx="340" cy="340" r="128" fill="#fff" opacity=".95"/>
      <path d="m220 505 122-171 94 104 68-70 124 137Z" fill="#312e81"/>
      <circle cx="406" cy="278" r="38" fill="#fbbf24"/>
      <text x="690" y="355" fill="#fff" font-family="Arial,sans-serif" font-size="92" font-weight="700" text-anchor="middle">SVGLO</text>
      <text x="690" y="420" fill="#e0e7ff" font-family="Arial,sans-serif" font-size="28" letter-spacing="8" text-anchor="middle">VECTOR → PIXEL</text>
    </svg>`;
    const next = parseSvg(markup, 'svglo-example.svg');
    setSvg(next);
    setOutputWidth(1200);
    setError(null);
  }, []);

  useEffect(() => {
    document.title = 'SVG to JPG Converter – Convert SVG to JPEG | SVGlo';
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute(
      'content',
      "Use SVGlo's free SVG to JPG converter to set image size, quality, and background color. Convert SVG to JPEG privately in your browser with no uploads.",
    );
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalOrigin = canonical ? new URL(canonical.href).origin : window.location.origin;
    const pageUrl = `${canonicalOrigin}/svg-to-jpg/`;
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
    const blob = new Blob([svg.markup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    setRendering(true);
    setReady(false);
    setEstimatedSizes({});

    image.onload = () => {
      if (id !== renderIdRef.current) return;
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        setError('Canvas is unavailable in this browser.');
        return;
      }
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
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
    const estimateAll = async () => {
      const sizes: EstimatedSizes = {};
      for (const option of QUALITY_OPTIONS) {
        try {
          sizes[option.id] = await estimateJpgSize(canvas, option.value);
        } catch {
          // A missing estimate should not prevent conversion or download.
        }
        if (id !== estimateIdRef.current) return;
        setEstimatedSizes({ ...sizes });
      }
    };
    void estimateAll();
    return () => {
      estimateIdRef.current++;
    };
  }, [ready]);

  const download = useCallback(() => {
    if (!canvasRef.current || !svg || !ready) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        setError('The JPG could not be created. Try a smaller output size.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${svg.name}.jpg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', quality.value);
  }, [quality, ready, svg]);

  const reset = useCallback(() => {
    renderIdRef.current++;
    estimateIdRef.current++;
    setSvg(null);
    setReady(false);
    setEstimatedSizes({});
    setError(null);
  }, []);

  const invalidSize = outputWidth < 1 || outputWidth > MAX_OUTPUT_EDGE || outputHeight > MAX_OUTPUT_EDGE;

  return (
    <div className="app svg-jpg-app">
      <Header hasImage={!!svg} onReset={reset} currentTool="svg-to-jpg" />
      <main className="main svg-jpg-main">
        <section className="svg-jpg-hero">
          <div className="svg-jpg-heading">
            <span className="tool-kicker">SVG → JPG</span>
            <h1>SVG to JPG Converter <span>for clear, ready-to-share images.</span></h1>
            <p>Convert SVG to JPG or JPEG online. Set the exact size, background, and compression—your file never leaves this browser.</p>
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
              <div className="svg-jpg-drop-icon"><OutputIcon /></div>
              <h2>Drop your SVG here</h2>
              <p>or click to choose a file · up to 10 MB</p>
              <button
                className="example-link"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  loadExample();
                }}
              >
                Try the sample artwork
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
                </div>

                <div className="export-field">
                  <label htmlFor="jpg-width">Output size</label>
                  <div className="dimension-row">
                    <div><input id="jpg-width" type="number" min="1" max={MAX_OUTPUT_EDGE} value={outputWidth} onChange={(event) => setOutputWidth(Number(event.target.value))} /><span>W</span></div>
                    <span className="dimension-link" aria-label="Aspect ratio locked">⌁</span>
                    <div><input type="number" value={outputHeight || ''} readOnly aria-label="Output height" /><span>H</span></div>
                  </div>
                  <p>Aspect ratio locked · maximum {MAX_OUTPUT_EDGE}px per side</p>
                </div>

                <div className="export-field">
                  <label id="jpg-quality-label">Image quality</label>
                  <div className="quality-options" role="group" aria-labelledby="jpg-quality-label">
                    {QUALITY_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={qualityMode === option.id ? 'is-active' : ''}
                        aria-pressed={qualityMode === option.id}
                        onClick={() => setQualityMode(option.id)}
                      >
                        <span>{option.label}</span>
                        <small>{formatFileSize(estimatedSizes[option.id])}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="export-field">
                  <label htmlFor="jpg-background">Background color</label>
                  <div className="color-field">
                    <input id="jpg-background" type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
                    <input type="text" value={background.toUpperCase()} onChange={(event) => /^#[0-9a-f]{6}$/i.test(event.target.value) && setBackground(event.target.value)} aria-label="Background hex color" />
                    {['#ffffff', '#f4f6fb', '#171b26'].map((color) => (
                      <button key={color} type="button" style={{ background: color }} onClick={() => setBackground(color)} aria-label={`Use ${color} background`} />
                    ))}
                  </div>
                </div>

                {invalidSize && <p className="svg-jpg-error" role="alert">Keep both dimensions between 1 and {MAX_OUTPUT_EDGE}px.</p>}
                {error && <p className="svg-jpg-error" role="alert">{error}</p>}
                <button className="download-jpg" type="button" disabled={!ready || rendering || invalidSize} onClick={download}>
                  {rendering ? 'Rendering preview…' : `Download JPG${estimatedSizes[qualityMode] ? ` · ${formatFileSize(estimatedSizes[qualityMode])}` : ''}`}
                  {!rendering && <span aria-hidden>↓</span>}
                </button>
                <p className="local-note"><span>✓</span> Processed locally. Nothing is uploaded.</p>
              </aside>

              <section className="jpg-preview" aria-label="JPG preview">
                <div className="jpg-preview-bar">
                  <div><span className="live-dot" /> JPG preview</div>
                  <span>{outputWidth} × {outputHeight}px</span>
                </div>
                <div className="jpg-preview-stage">
                  <canvas ref={canvasRef} aria-label="Rendered JPG preview" />
                  {rendering && <div className="jpg-rendering">Rendering…</div>}
                </div>
                <div className="jpg-preview-caption">
                  <span>Transparent areas become <i style={{ background }} /> {background.toUpperCase()}</span>
                  <span>{quality.label} · {formatFileSize(estimatedSizes[qualityMode])}</span>
                </div>
              </section>
            </div>
          )}
        </section>

        <section className="svg-jpg-explainer">
          <div><span>01</span><h2>Choose an SVG</h2><p>Drop in a logo, icon, illustration, or exported vector file.</p></div>
          <div><span>02</span><h2>Convert SVG to JPG</h2><p>Pick a pixel size, quality level, and solid background for transparent areas.</p></div>
          <div><span>03</span><h2>Download the JPG</h2><p>Get a browser-rendered JPEG ready for slides, stores, and social posts.</p></div>
        </section>
        <SvgToJpgArticle />
        <RelatedTools current="svg-to-jpg" />
      </main>
      <Footer />
    </div>
  );
}
