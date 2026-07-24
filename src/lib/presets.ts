import type { VTracerConfig } from './vtracer';

export const DEFAULT_CONFIG: VTracerConfig = {
  colormode: 'color',
  hierarchical: 'stacked',
  mode: 'spline',
  filter_speckle: 4,
  color_precision: 6,
  layer_difference: 16,
  corner_threshold: 60,
  length_threshold: 4,
  splice_threshold: 45,
  path_precision: 8,
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
    config: { ...DEFAULT_CONFIG, colormode: 'binary' },
  },
  {
    id: 'poster',
    config: { ...DEFAULT_CONFIG, color_precision: 8 },
  },
  {
    id: 'photo',
    config: {
      ...DEFAULT_CONFIG,
      filter_speckle: 10,
      color_precision: 8,
      layer_difference: 48,
      corner_threshold: 180,
    },
  },
  {
    id: 'pixel',
    config: {
      ...DEFAULT_CONFIG,
      colormode: 'color',
      mode: 'none',
      filter_speckle: 0,
      layer_difference: 0,
      corner_threshold: 180,
    },
  },
];
