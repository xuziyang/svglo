// Bridges the visioncortex VTracer 1.0 WebAssembly module to TypeScript.
//
// The browser package is built from vtracer/nodejs with
// `wasm-pack build --target web` and vendored at vendor/vtracer-wasm-pkg.
// Unlike the pre-1.0 webapp (DOM-coupled tick loop), 1.0 takes raw RGBA
// pixels and returns a complete SVG string via convertPixels / vectorize_rgba.
//
// Parameter units match the Rust Config / Node bindings directly:
// filterSpeckle is a side length (framework squares it), colorPrecision is
// significant bits, angles are degrees, simplify is a pixel tolerance.

import init, { vectorize_rgba } from 'vtracer-wasm';
import wasmUrl from 'vtracer-wasm/vtracer_wasm_bg.wasm?url';

/** Region-forming algorithm (replaces the old color/binary "color mode"). */
export type Clustering = 'color-cluster' | 'bw' | 'watershed';
export type Hierarchical = 'stacked' | 'cutout';
/** Curve fit mode. `pixel` is the 1.0 name for the old webapp's `none`. */
export type PathMode = 'spline' | 'polygon' | 'pixel';

export interface VTracerConfig {
  clustering: Clustering;
  hierarchical: Hierarchical;
  mode: PathMode;
  /** Discard patches smaller than X×X px (side length; 0..=128). */
  filter_speckle: number;
  /** Significant bits per RGB channel (1..=8). Higher = more colors. */
  color_precision: number;
  /** Color difference between gradient layers (0..=255). 0 = diagonal mode. */
  layer_difference: number;
  /** Min momentary angle (deg, 0..=180) kept as a corner. */
  corner_threshold: number;
  /** Iterative subdivide-smooth until segments are shorter than this (3.5..=10). */
  length_threshold: number;
  /** Min angle displacement (deg, 0..=180) to splice a spline. */
  splice_threshold: number;
  /** Decimal places in the SVG path string (0..=16). */
  path_precision: number;
  /**
   * Curve simplification tolerance in px (paper.js-style). `null` = off.
   * Typical range 1–2.5; only affects spline mode.
   */
  simplify: number | null;
  /** Watershed hierarchy cut level (0..=255). Higher = more regions. */
  watershed_detail: number;
}

/** CamelCase options object accepted by the 1.0 wasm bindings. */
export interface VTracerOptions {
  clustering?: Clustering;
  hierarchical?: Hierarchical;
  mode?: PathMode;
  filterSpeckle?: number;
  colorPrecision?: number;
  layerDifference?: number;
  cornerThreshold?: number;
  lengthThreshold?: number;
  maxIterations?: number;
  spliceThreshold?: number;
  simplify?: number;
  pathPrecision?: number;
  optimize?: number;
  watershedDetail?: number;
}

let initPromise: Promise<void> | null = null;

/** Initialise the wasm module exactly once; allow retry on failure. */
export function ensureWasm(): Promise<void> {
  if (!initPromise) {
    initPromise = init({ module_or_path: wasmUrl }).then(
      () => undefined,
      (err) => {
        initPromise = null;
        throw err;
      },
    );
  }
  return initPromise;
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

export interface ConvertOptions {
  canvas: HTMLCanvasElement;
  config: VTracerConfig;
  shouldStop?: () => boolean;
}

/**
 * Convert the image currently drawn on `canvas` into an SVG document string.
 * Runs synchronously inside wasm after init; callers should yield to the event
 * loop first so a "running" UI state can paint.
 */
export async function convertImage(opts: ConvertOptions): Promise<string> {
  const { canvas, config, shouldStop } = opts;
  await ensureWasm();
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
  // Copy into a plain Uint8Array — wasm-bindgen wants Uint8Array, not Clamped.
  const rgba = new Uint8Array(imageData.data.buffer.slice(0));
  const options = buildOptions(config);

  // Yield once more so a superseding convert can cancel before the heavy work.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  if (shouldStop?.()) {
    throw new DOMException('Conversion cancelled', 'AbortError');
  }

  const svg = vectorize_rgba(rgba, width, height, options);
  if (shouldStop?.()) {
    throw new DOMException('Conversion cancelled', 'AbortError');
  }
  return svg;
}
