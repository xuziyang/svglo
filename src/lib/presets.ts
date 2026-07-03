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

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: VTracerConfig;
}

export const PRESETS: Preset[] = [
  {
    id: 'default',
    name: '通用',
    description: '适合大多数图标 / 插画',
    config: { ...DEFAULT_CONFIG },
  },
  {
    id: 'bw',
    name: '黑白线稿',
    description: '二值化，适合扫描文档 / 蓝图 / 线稿',
    config: { ...DEFAULT_CONFIG, colormode: 'binary' },
  },
  {
    id: 'poster',
    name: '海报',
    description: '扁平彩色插画，保留完整颜色',
    config: { ...DEFAULT_CONFIG, color_precision: 8 },
  },
  {
    id: 'photo',
    name: '照片',
    description: '连续色调，合并相近色层',
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
    name: '像素画',
    description: '不做曲线简化，保留像素方块',
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
