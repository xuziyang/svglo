import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { ControlPanel } from './components/ControlPanel';
import { PreviewPane, type PreviewView } from './components/PreviewPane';
import { useVTracer } from './hooks/useVTracer';
import { useT } from './i18n/LocaleContext';
import { DEFAULT_CONFIG, PRESETS, type Preset } from './lib/presets';
import type { VTracerConfig } from './lib/vtracer';

export default function App() {
  const t = useT();
  const { status, progress, svgString, error, convert, cancel } = useVTracer();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // configRef mirrors `config` so the image-load effect can read the latest
  // config without re-subscribing on every config change.
  const configRef = useRef<VTracerConfig>(DEFAULT_CONFIG);
  const hasImageRef = useRef(false);
  const urlRef = useRef<string | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ w: number; h: number } | null>(null);
  const [config, setConfig] = useState<VTracerConfig>(DEFAULT_CONFIG);
  const [view, setView] = useState<PreviewView>('after');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // New image: paint it onto the working canvas, then kick off a conversion.
  useEffect(() => {
    if (!imageSrc) {
      hasImageRef.current = false;
      return;
    }
    hasImageRef.current = true;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const svg = svgRef.current;
      if (!canvas || !svg) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setImageDims({ w: img.naturalWidth, h: img.naturalHeight });
      convert(canvas, svg, configRef.current);
    };
    img.src = imageSrc;
    return () => {
      img.src = '';
    };
  }, [imageSrc, convert]);

  // Config change: debounce, then re-convert using the pixels already on the
  // canvas (no need to re-decode the source image).
  useEffect(() => {
    if (!hasImageRef.current) return;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      const svg = svgRef.current;
      if (!canvas || !svg) return;
      convert(canvas, svg, config);
    }, 300);
    return () => clearTimeout(timer);
  }, [config, convert]);

  const handleImage = useCallback((file: File) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setImageDims(null);
    setImageSrc(url);
    setView('after');
  }, []);

  const handleReset = useCallback(() => {
    cancel();
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    hasImageRef.current = false;
    setImageSrc(null);
    setImageDims(null);
  }, [cancel]);

  const handleDownload = useCallback(() => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.download = `svglo-${ts}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [svgString]);

  const handleCopy = useCallback(async () => {
    if (!svgString) return;
    try {
      await navigator.clipboard.writeText(svgString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  }, [svgString]);

  const handlePreset = useCallback((preset: Preset) => {
    setConfig(preset.config);
  }, []);

  const updateConfig = useCallback((partial: Partial<VTracerConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const activePresetId = useMemo(() => {
    const keys = Object.keys(DEFAULT_CONFIG) as (keyof VTracerConfig)[];
    return PRESETS.find((p) => keys.every((k) => p.config[k] === config[k]))?.id ?? null;
  }, [config]);

  return (
    <div className="app">
      <Header hasImage={!!imageSrc} onReset={handleReset} />

      <main className="main">
        {!imageSrc ? (
          <div className="hero">
            <div className="hero-text">
              <h1>
                {t('hero.titleBefore')}{' '}
                <span className="accent">{t('hero.titleAccent')}</span>
              </h1>
              <p className="hero-lead">{t('hero.lead')}</p>
              <ul className="hero-feats">
                <li>{t('hero.featLocal')}</li>
                <li>{t('hero.featModes')}</li>
                <li>{t('hero.featParams')}</li>
                <li>{t('hero.featExport')}</li>
              </ul>
            </div>
            <Dropzone onImage={handleImage} />
          </div>
        ) : (
          <div className="workspace">
            <ControlPanel
              config={config}
              onChange={updateConfig}
              onPreset={handlePreset}
              activePresetId={activePresetId}
            />
            <PreviewPane
              imageSrc={imageSrc}
              imageDims={imageDims}
              canvasRef={canvasRef}
              svgRef={svgRef}
              view={view}
              onViewChange={setView}
              status={status}
              progress={progress}
              svgString={svgString}
              error={error}
              onDownload={handleDownload}
              onCopy={handleCopy}
              copied={copied}
            />
          </div>
        )}
      </main>
    </div>
  );
}
