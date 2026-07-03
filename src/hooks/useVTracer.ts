import { useCallback, useRef, useState } from 'react';
import { convertImage, type VTracerConfig } from '../lib/vtracer';

export type ConvertStatus = 'idle' | 'running' | 'done' | 'error';

export interface VTracerState {
  status: ConvertStatus;
  progress: number;
  svgString: string | null;
  error: string | null;
  convert: (canvas: HTMLCanvasElement, svg: SVGSVGElement, config: VTracerConfig) => void;
  cancel: () => void;
}

/**
 * Drives the wasm converter. Each call to `convert` supersedes any in-flight
 * run (via a monotonic sequence id) so rapid parameter changes don't race.
 */
export function useVTracer(): VTracerState {
  const [status, setStatus] = useState<ConvertStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // seqRef: only the latest convert call is allowed to commit state.
  const seqRef = useRef(0);

  const convert = useCallback(
    (canvas: HTMLCanvasElement, svg: SVGSVGElement, config: VTracerConfig) => {
      const seq = ++seqRef.current;
      setStatus('running');
      setProgress(0);
      setError(null);

      convertImage({
        canvas,
        svg,
        config,
        onProgress: (p) => {
          if (seq === seqRef.current) setProgress(p);
        },
        shouldStop: () => seq !== seqRef.current,
      })
        .then((result) => {
          if (seq !== seqRef.current) return;
          setSvgString(result);
          setProgress(100);
          setStatus('done');
        })
        .catch((e: unknown) => {
          if (seq !== seqRef.current) return;
          setError(e instanceof Error ? e.message : String(e));
          setStatus('error');
        });
    },
    [],
  );

  const cancel = useCallback(() => {
    seqRef.current++;
    setStatus('idle');
    setProgress(0);
  }, []);

  return { status, progress, svgString, error, convert, cancel };
}
