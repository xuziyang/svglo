import type { VTracerConfig } from './vtracer';

export const DEFAULT_CONFIG: VTracerConfig = {
  clustering: 'color-cluster',
  hierarchical: 'stacked',
  mode: 'spline',
  filter_speckle: 4,
  color_precision: 6,
  layer_difference: 16,
  corner_threshold: 60,
  length_threshold: 4,
  splice_threshold: 45,
  path_precision: 8,
  simplify: 1,
  watershed_detail: 128,
};

export type PresetId = 'default' | 'bw' | 'poster' | 'photo' | 'pixel';

export interface Preset {
  id: PresetId;
  config: VTracerConfig;
}

export const PRESETS: Preset[] = [
  {
    id: 'default',
    config: { ...DEFAULT_CONFIG },
  },
  {
    id: 'bw',
    config: { ...DEFAULT_CONFIG, clustering: 'bw' },
  },
  {
    id: 'poster',
    config: {
      ...DEFAULT_CONFIG,
      color_precision: 8,
      simplify: 1,
    },
  },
  {
    id: 'photo',
    config: {
      ...DEFAULT_CONFIG,
      // Content-adaptive regions + light simplification for continuous tones.
      clustering: 'watershed',
      hierarchical: 'cutout',
      filter_speckle: 10,
      color_precision: 8,
      layer_difference: 48,
      corner_threshold: 180,
      watershed_detail: 160,
      simplify: 1.5,
    },
  },
  {
    id: 'pixel',
    config: {
      ...DEFAULT_CONFIG,
      clustering: 'color-cluster',
      mode: 'pixel',
      filter_speckle: 0,
      layer_difference: 0,
      corner_threshold: 180,
      simplify: null,
    },
  },
];
