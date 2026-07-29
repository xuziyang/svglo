// Bridges the visioncortex VTracer 1.0 WebAssembly module to TypeScript.
//
// The browser package is built from vtracer/nodejs with
// `wasm-pack build --target web` and vendored at vendor/vtracer-wasm-pkg.
// Unlike the pre-1.0 webapp (DOM-coupled tick loop), 1.0 takes raw RGBA
// pixels and returns a complete SVG string via convertPixels / vectorize_rgba.
//
// Tracing happens in a dedicated Web Worker (see ../workers/vtracer.worker.ts)
// so the main thread isn't blocked by the synchronous wasm call. Pixels are
// passed via a transferable ArrayBuffer to keep the cross-thread cost low.
//
// Parameter units match the Rust Config / Node bindings directly:
// filterSpeckle is a side length (framework squares it), colorPrecision is
// significant bits, angles are degrees, simplify is a pixel tolerance.

import type {
  Clustering,
  Hierarchical,
  PathMode,
  VTracerConfig,
  VTracerOptions,
} from './vtracer-shared';

export type { Clustering, Hierarchical, PathMode, VTracerConfig, VTracerOptions };

export interface ConvertOptions {
  canvas: HTMLCanvasElement;
  config: VTracerConfig;
  shouldStop?: () => boolean;
}

/** Map the friendly UI config to the 1.0 wasm options object. */
export function buildOptions(c: VTracerConfig): VTracerOptions {
  const options: VTracerOptions = {
    clustering: c.clustering,
    hierarchical: c.hierarchical,
    mode: c.mode,
    filterSpeckle: c.filter_speckle,
    colorPrecision: c.color_precision,
    layerDifference: c.layer_difference,
    cornerThreshold: c.corner_threshold,
    lengthThreshold: c.length_threshold,
    maxIterations: 10,
    spliceThreshold: c.splice_threshold,
    pathPrecision: c.path_precision,
    // Compact relative encoding + shorthands/grouping.
    optimize: 2,
    watershedDetail: c.watershed_detail,
  };
  if (c.simplify != null && c.simplify > 0) {
    options.simplify = c.simplify;
  }
  return options;
}

// Lazy worker singleton. We import.meta.url-resolve the worker so Vite emits
// it as a separate entry chunk. `type: 'module'` matches the worker's own
// module-mode build.
let workerInstance: Worker | null = null;
let nextRequestId = 1;
const pending = new Map<number, { resolve: (svg: string) => void; reject: (err: Error) => void }>();

function getWorker(): Worker {
  if (workerInstance) return workerInstance;
  const url = new URL('../workers/vtracer.worker.ts', import.meta.url);
  workerInstance = new Worker(url, { type: 'module' });
  workerInstance.onmessage = (event: MessageEvent<{ id: number; svg?: string; error?: string }>) => {
    const { id, svg, error } = event.data;
    const slot = pending.get(id);
    if (!slot) return;
    pending.delete(id);
    if (error) slot.reject(new Error(error));
    else slot.resolve(svg ?? '');
  };
  workerInstance.onerror = (event) => {
    // Worker died — fail every in-flight request and force a fresh worker.
    const err = new Error(event.message || 'vtracer worker crashed');
    for (const [, slot] of pending) slot.reject(err);
    pending.clear();
    workerInstance?.terminate();
    workerInstance = null;
  };
  return workerInstance;
}

function callWorker(pixels: Uint8Array, width: number, height: number, options: VTracerOptions): Promise<string> {
  const id = nextRequestId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    const worker = getWorker();
    // Transferable: hand off the underlying buffer. The Uint8Array view
    // becomes detached on the sender side after postMessage.
    const buffer = pixels.buffer.slice(pixels.byteOffset, pixels.byteOffset + pixels.byteLength);
    worker.postMessage({ id, pixels: buffer, width, height, options }, [buffer]);
  });
}

/**
 * Convert the image currently drawn on `canvas` into an SVG document string.
 * Runs the wasm synchronously inside the worker, so the caller remains free
 * to respond to other events while the trace is in flight.
 */
export async function convertImage(opts: ConvertOptions): Promise<string> {
  const { canvas, config, shouldStop } = opts;

  if (shouldStop?.()) {
    throw new DOMException('Conversion cancelled', 'AbortError');
  }

  const width = canvas.width;
  const height = canvas.height;
  if (width <= 0 || height <= 0) {
    throw new Error('Canvas has no image data');
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  // Copy into a fresh Uint8Array — the worker expects its own buffer.
  // We hand off the buffer as transferable so no structured clone copy is made.
  const rgba = new Uint8Array(width * height * 4);
  rgba.set(imageData.data);

  // Yield once so a superseding convert can cancel before the heavy work.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  if (shouldStop?.()) {
    throw new DOMException('Conversion cancelled', 'AbortError');
  }

  const options = buildOptions(config);
  const svg = await callWorker(rgba, width, height, options);

  if (shouldStop?.()) {
    throw new DOMException('Conversion cancelled', 'AbortError');
  }
  return svg;
}
