// Bridges the visioncortex VTracer WebAssembly module to TypeScript.
//
// The wasm crate (vtracer/webapp) exposes two DOM-coupled converters that
// read pixels from a <canvas> and write <path> elements into an <svg> by id.
// This wrapper replicates the parameter transformations from the original
// webapp (index.js) so the rest of the React app can work in friendly
// user-facing units (degrees, side-length, significant bits).

import init, { ColorImageConverter, BinaryImageConverter } from 'vtracer-webapp';
import wasmUrl from 'vtracer-webapp/vtracer_webapp_bg.wasm?url';

export type ColorMode = 'color' | 'binary';
export type Hierarchical = 'stacked' | 'cutout';
export type PathMode = 'spline' | 'polygon' | 'none';

export interface VTracerConfig {
  colormode: ColorMode;
  hierarchical: Hierarchical;
  mode: PathMode;
  /** Discard patches smaller than X*X px (1..16, side length). */
  filter_speckle: number;
  /** Significant bits per RGB channel (1..8). Higher = more colors. */
  color_precision: number;
  /** Color difference between gradient layers (0..255). 0 = diagonal mode. */
  layer_difference: number;
  /** Min momentary angle (deg, 0..180) to be kept as a corner. */
  corner_threshold: number;
  /** Iterative subdivide-smooth until segments are shorter than this (3.5..10). */
  length_threshold: number;
  /** Min angle displacement (deg, 0..180) to splice a spline. */
  splice_threshold: number;
  /** Decimal places in the SVG path string (0..16). */
  path_precision: number;
}

let initPromise: Promise<void> | null = null;

/** Initialise the wasm module exactly once; allow retry on failure. */
export function ensureWasm(): Promise<void> {
  if (!initPromise) {
    initPromise = init(wasmUrl).then(
      () => undefined,
      (err) => {
        initPromise = null;
        throw err;
      },
    );
  }
  return initPromise;
}

const deg2rad = (deg: number): number => (deg / 180) * Math.PI;

function buildParams(canvasId: string, svgId: string, c: VTracerConfig): string {
  // Mirror the transformations in vtracer/webapp/app/index.js (restart()).
  // - filter_speckle is squared into an area threshold
  // - color_precision is inverted to a "loss" (8 - significant_bits)
  // - angle thresholds are converted to radians
  return JSON.stringify({
    canvas_id: canvasId,
    svg_id: svgId,
    mode: c.mode,
    hierarchical: c.hierarchical,
    corner_threshold: deg2rad(c.corner_threshold),
    length_threshold: c.length_threshold,
    max_iterations: 10,
    splice_threshold: deg2rad(c.splice_threshold),
    filter_speckle: c.filter_speckle * c.filter_speckle,
    color_precision: 8 - c.color_precision,
    layer_difference: c.layer_difference,
    path_precision: c.path_precision,
  });
}

type Converter = ColorImageConverter | BinaryImageConverter;

function runTickLoop(
  converter: Converter,
  onProgress?: (p: number) => void,
  shouldStop?: () => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    let lastPct = -1;
    const tick = () => {
      if (shouldStop?.()) {
        resolve();
        return;
      }
      // Time-slice: keep each batch under ~25ms so the UI stays responsive.
      let done = false;
      const start = performance.now();
      while (!(done = converter.tick()) && performance.now() - start < 25) {
        // batch
      }
      // Throttle progress callbacks to integer-percent changes so a 1ms tick
      // cadence doesn't trigger dozens of React re-renders per second.
      const p = converter.progress();
      const pct = Math.round(p);
      if (onProgress && pct !== lastPct) {
        lastPct = pct;
        onProgress(p);
      }
      if (done) {
        resolve();
        return;
      }
      setTimeout(tick, 1);
    };
    setTimeout(tick, 1);
  });
}

export interface ConvertOptions {
  canvas: HTMLCanvasElement;
  svg: SVGSVGElement;
  config: VTracerConfig;
  onProgress?: (p: number) => void;
  shouldStop?: () => boolean;
}

/**
 * Convert the image currently drawn on `canvas` into SVG paths written into
 * `svg`. Returns the serialized SVG document as a string.
 */
export async function convertImage(opts: ConvertOptions): Promise<string> {
  const { canvas, svg, config, onProgress, shouldStop } = opts;
  await ensureWasm();

  // Clear any paths from a previous run.
  svg.replaceChildren();

  const params = buildParams(canvas.id, svg.id, config);
  const converter: Converter =
    config.colormode === 'binary'
      ? BinaryImageConverter.new_with_string(params)
      : ColorImageConverter.new_with_string(params);

  try {
    converter.init();
    await runTickLoop(converter, onProgress, shouldStop);
    const svgString = new XMLSerializer().serializeToString(svg);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
  } finally {
    converter.free();
  }
}
