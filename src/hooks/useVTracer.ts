import { useCallback, useEffect, useRef, useState } from 'react';
import { convertImage, ensureWasm, type VTracerConfig } from '../lib/vtracer';

export type ConvertStatus = 'idle' | 'loading' | 'running' | 'done' | 'error';

export interface VTracerState {
  status: ConvertStatus;
  progress: number;
  svgString: string | null;
  pathCount: number;
  error: string | null;
  /** True once the wasm module has finished loading at least once. */
  engineReady: boolean;
  convert: (canvas: HTMLCanvasElement, svg: SVGSVGElement, config: VTracerConfig) => void;
  /** Abort an in-flight run but keep the last good result. */
  cancel: () => void;
  /** Abort and clear result state (used when leaving the workspace). */
  reset: () => void;
  /** Clear the displayed result without tearing down the engine (e.g. new image). */
  clearResult: () => void;
  preload: () => void;
}

function countPaths(svgMarkup: string): number {
  // Count opening <path tags in the serialized document — cheap and good enough for UX.
  const matches = svgMarkup.match(/<path\b/gi);
  return matches?.length ?? 0;
}

/**
 * Drives the wasm converter. Each call to `convert` supersedes any in-flight
 * run (via a monotonic sequence id) so rapid parameter changes don't race.
 *
 * Previous `svgString` is kept while a re-conversion runs so the UI can keep
 * showing the last good result instead of flashing empty.
 */
export function useVTracer(): VTracerState {
  const [status, setStatus] = useState<ConvertStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [pathCount, setPathCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [engineReady, setEngineReady] = useState(false);

  // seqRef: only the latest convert call is allowed to commit state.
  const seqRef = useRef(0);
  const preloadStarted = useRef(false);
  const hasResultRef = useRef(false);

  const preload = useCallback(() => {
    if (preloadStarted.current) return;
    preloadStarted.current = true;
    setStatus((prev) => (prev === 'idle' ? 'loading' : prev));
    void ensureWasm()
      .then(() => {
        setEngineReady(true);
        setStatus((prev) => (prev === 'loading' ? 'idle' : prev));
      })
      .catch(() => {
        // Leave engineReady false; the next convert will surface the error.
        preloadStarted.current = false;
        setStatus((prev) => (prev === 'loading' ? 'idle' : prev));
      });
  }, []);

  // Warm the wasm module as soon as the hook mounts so the first convert
  // does not pay the full download+compile cost on the critical path.
  useEffect(() => {
    preload();
  }, [preload]);

  const convert = useCallback(
    (canvas: HTMLCanvasElement, svg: SVGSVGElement, config: VTracerConfig) => {
      const seq = ++seqRef.current;
      setStatus('running');
      setProgress(0);
      setError(null);
      // Intentionally keep the previous svgString/pathCount until the new run
      // finishes so the preview can stay stable during parameter tweaks.

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
          hasResultRef.current = true;
          setSvgString(result);
          setPathCount(countPaths(result));
          setProgress(100);
          setStatus('done');
          setEngineReady(true);
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
    // Keep the last good result if we had one; only clear the running state.
    setStatus(hasResultRef.current ? 'done' : 'idle');
    setProgress(0);
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    seqRef.current++;
    hasResultRef.current = false;
    setSvgString(null);
    setPathCount(0);
    setProgress(0);
    setError(null);
    setStatus(engineReady ? 'idle' : 'loading');
  }, [engineReady]);

  const reset = useCallback(() => {
    clearResult();
  }, [clearResult]);

  return {
    status,
    progress,
    svgString,
    pathCount,
    error,
    engineReady,
    convert,
    cancel,
    reset,
    clearResult,
    preload,
  };
}
