// Shared configuration types and option-mapping helpers for VTracer. This
// file is imported by both the main thread bridge (../lib/vtracer.ts) and
// the worker (../workers/vtracer.worker.ts), keeping the type contract
// stable across the postMessage boundary without dragging the worker
// implementation into the main bundle.

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
