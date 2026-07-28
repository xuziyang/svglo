import { useCallback, useRef, useState } from 'react';
import { convertImage, type VTracerConfig } from '../lib/vtracer';

export type ConvertStatus = 'idle' | 'running' | 'done' | 'error';

export interface VTracerState {
  status: ConvertStatus;
  progress: number;
  svgString: string | null;
  error: string | null;
  convert: (canvas: HTMLCanvasElement, config: VTracerConfig) => void;
  cancel: () => void;
}

/**
 * Drives the 1.0 wasm converter. Each call to `convert` supersedes any
 * in-flight run (via a monotonic sequence id) so rapid parameter changes
 * don't race. Progress is coarse: the 1.0 browser binding is synchronous,
 * so we only report start → done (or cancelled).
 */
export function useVTracer(): VTracerState {
  const [status, setStatus] = useState<ConvertStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // seqRef: only the latest convert call is allowed to commit state.
  const seqRef = useRef(0);

  const convert = useCallback((canvas: HTMLCanvasElement, config: VTracerConfig) => {
    const seq = ++seqRef.current;
    setStatus('running');
    setProgress(8);
    setError(null);

    // Yield so React can paint the running overlay before the sync wasm work.
    const start = async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (seq !== seqRef.current) return;

      try {
        const result = await convertImage({
          canvas,
          config,
          shouldStop: () => seq !== seqRef.current,
        });
        if (seq !== seqRef.current) return;
        setSvgString(result);
        setProgress(100);
        setStatus('done');
      } catch (e: unknown) {
        if (seq !== seqRef.current) return;
        // Superseded runs throw AbortError — treat as a silent cancel.
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      }
    };

    void start();
  }, []);

  const cancel = useCallback(() => {
    seqRef.current++;
    setStatus('idle');
    setProgress(0);
  }, []);

  return { status, progress, svgString, error, convert, cancel };
}
