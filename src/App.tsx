import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Dropzone } from './components/Dropzone';
import { Article } from './components/Article';
import { ControlPanel } from './components/ControlPanel';
import { PreviewPane, type PreviewView } from './components/PreviewPane';
import { useVTracer } from './hooks/useVTracer';
import { t } from './i18n';
import { DEFAULT_CONFIG, PRESETS, type Preset, type PresetId } from './lib/presets';
import type { VTracerConfig } from './lib/vtracer';

export default function App() {
  const { status, progress, svgString, pathCount, error, convert, cancel, reset, clearResult } =
    useVTracer();

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
  const [selectedPresetId, setSelectedPresetId] = useState<PresetId>('default');
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

  const handleImage = useCallback(
    (file: File) => {
      // Drop the previous vector so we never show a stale result for a new image.
      clearResult();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setImageDims(null);
      setImageSrc(url);
      setView('after');
      setCopied(false);
      // Keep converter config/preset; a new convert will start from the image-load effect.
    },
    [clearResult],
  );

  const handleReset = useCallback(() => {
    reset();
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    hasImageRef.current = false;
    setImageSrc(null);
    setImageDims(null);
    setCopied(false);
  }, [reset]);

  const handleExample = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#eef2ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(60, 52, 600, 376, 32);
    ctx.fill();

    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(360, 224, 112, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(388, 188, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.moveTo(260, 304);
    ctx.lineTo(336, 202);
    ctx.lineTo(390, 260);
    ctx.lineTo(432, 218);
    ctx.lineTo(476, 304);
    ctx.closePath();
    ctx.fill();

    canvas.toBlob((blob) => {
      if (!blob) return;
      handleImage(new File([blob], 'svglo-example.png', { type: 'image/png' }));
    }, 'image/png');
  }, [handleImage]);

  const handleRetry = useCallback(() => {
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!canvas || !svg || !hasImageRef.current) return;
    convert(canvas, svg, config);
  }, [config, convert]);

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
    setSelectedPresetId(preset.id);
    setConfig(preset.config);
  }, []);

  const updateConfig = useCallback((partial: Partial<VTracerConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const selectedPreset = useMemo(
    () => PRESETS.find((preset) => preset.id === selectedPresetId) ?? PRESETS[0],
    [selectedPresetId],
  );

  const isCustomized = useMemo(() => {
    const keys = Object.keys(DEFAULT_CONFIG) as (keyof VTracerConfig)[];
    return keys.some((key) => selectedPreset.config[key] !== config[key]);
  }, [config, selectedPreset]);

  const handleResetPreset = useCallback(() => {
    setConfig(selectedPreset.config);
  }, [selectedPreset]);

  return (
    <div className="app">
      <Header hasImage={!!imageSrc} onReset={handleReset} />

      <main className="main">
        {!imageSrc ? (
          <>
            <div className="hero">
              <div className="hero-text">
                <h1>
                  {t('hero.titleBefore')}{' '}
                  <span className="accent">{t('hero.titleAccent')}</span>
                </h1>
                <p className="hero-lead">{t('hero.lead')}</p>
                <ul className="hero-feats">
                  <li>
                    <FeatIcon d="M12 3l7 3v5c0 4.4-3 8.1-7 9.5C8 19.1 5 15.4 5 11V6l7-3z" />
                    <span>{t('hero.featLocal')}</span>
                  </li>
                  <li>
                    <FeatIcon d="M12 3a9 9 0 1 0 9 9h-4a5 5 0 1 1-5-5V3z" />
                    <span>{t('hero.featModes')}</span>
                  </li>
                  <li>
                    <FeatIcon d="M4 8h9M17 8h3M4 16h3M11 16h9M15 6v4M7 14v4" />
                    <span>{t('hero.featParams')}</span>
                  </li>
                  <li>
                    <FeatIcon d="M12 4v9M12 13l-4-4M12 13l4-4M5 19h14" />
                    <span>{t('hero.featExport')}</span>
                  </li>
                </ul>
              </div>
              <Dropzone onImage={handleImage} onExample={handleExample} />
            </div>
            <Article />
          </>
        ) : (
          <div className="workspace">
            <ControlPanel
              config={config}
              onChange={updateConfig}
              onPreset={handlePreset}
              selectedPresetId={selectedPresetId}
              isCustomized={isCustomized}
              onResetPreset={handleResetPreset}
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
              pathCount={pathCount}
              error={error}
              onRetry={handleRetry}
              onReset={handleReset}
              onCancel={cancel}
              onReplaceImage={handleImage}
              onDownload={handleDownload}
              onCopy={handleCopy}
              copied={copied}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function FeatIcon({ d }: { d: string }) {
  return (
    <svg
      className="feat-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
