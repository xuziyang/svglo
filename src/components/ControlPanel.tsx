import type { ReactNode } from 'react';
import type { ColorMode, Hierarchical, PathMode, VTracerConfig } from '../lib/vtracer';
import { PRESETS, type Preset } from '../lib/presets';

interface ControlPanelProps {
  config: VTracerConfig;
  onChange: (partial: Partial<VTracerConfig>) => void;
  onPreset: (preset: Preset) => void;
  activePresetId: string | null;
}

export function ControlPanel({ config, onChange, onPreset, activePresetId }: ControlPanelProps) {
  const isColor = config.colormode === 'color';
  const isSpline = config.mode === 'spline';

  return (
    <aside className="panel">
      <section className="panel-section">
        <h3>预设</h3>
        <div className="preset-grid">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`preset-btn ${activePresetId === p.id ? 'is-active' : ''}`}
              onClick={() => onPreset(p)}
              title={p.description}
            >
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>聚类</h3>

        <Field label="颜色模式" hint={isColor ? '彩色图像' : '黑白二值'}>
          <Segmented
            value={config.colormode}
            options={[
              { value: 'color', label: '彩色' },
              { value: 'binary', label: '黑白' },
            ]}
            onChange={(v) => onChange({ colormode: v as ColorMode })}
          />
        </Field>

        {isColor && (
          <Field label="层次策略" hint={config.hierarchical === 'stacked' ? '形状堆叠（更紧凑）' : '独立裁切（可单独编辑）'}>
            <Segmented
              value={config.hierarchical}
              options={[
                { value: 'stacked', label: '堆叠' },
                { value: 'cutout', label: '裁切' },
              ]}
              onChange={(v) => onChange({ hierarchical: v as Hierarchical })}
            />
          </Field>
        )}

        <Slider
          label="滤除斑点"
          hint="丢弃小于 X² 像素的色块（清理噪点）"
          value={config.filter_speckle}
          min={0}
          max={16}
          step={1}
          onChange={(v) => onChange({ filter_speckle: v })}
        />

        {isColor && (
          <>
            <Slider
              label="颜色精度"
              hint="RGB 通道有效位数，越大颜色越多"
              value={config.color_precision}
              min={1}
              max={8}
              step={1}
              onChange={(v) => onChange({ color_precision: v })}
            />
            <Slider
              label="渐变步长"
              hint="色层间颜色差异，0=对角聚类"
              value={config.layer_difference}
              min={0}
              max={255}
              step={1}
              onChange={(v) => onChange({ layer_difference: v })}
            />
          </>
        )}
      </section>

      <section className="panel-section">
        <h3>曲线拟合</h3>

        <Field label="拟合模式">
          <Segmented
            value={config.mode}
            options={[
              { value: 'spline', label: '样条' },
              { value: 'polygon', label: '多边形' },
              { value: 'none', label: '像素' },
            ]}
            onChange={(v) => onChange({ mode: v as PathMode })}
          />
        </Field>

        {isSpline && (
          <>
            <Slider
              label="拐角阈值"
              hint="保留为拐角的最小角度，越大越锐利"
              value={config.corner_threshold}
              min={0}
              max={180}
              step={1}
              unit="°"
              onChange={(v) => onChange({ corner_threshold: v })}
            />
            <Slider
              label="线段长度"
              hint="细分平滑直到线段短于此值"
              value={config.length_threshold}
              min={3.5}
              max={10}
              step={0.5}
              onChange={(v) => onChange({ length_threshold: v })}
            />
            <Slider
              label="拼接阈值"
              hint="拼接样条的最小角度位移"
              value={config.splice_threshold}
              min={0}
              max={180}
              step={1}
              unit="°"
              onChange={(v) => onChange({ splice_threshold: v })}
            />
          </>
        )}
      </section>

      <section className="panel-section">
        <Slider
          label="路径精度"
          hint="SVG 坐标小数位数，影响文件体积"
          value={config.path_precision}
          min={0}
          max={16}
          step={1}
          onChange={(v) => onChange({ path_precision: v })}
        />
      </section>
    </aside>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <div className="field-head">
        <span className="field-label">{label}</span>
        {hint && <span className="field-hint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

interface SegmentedProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function Segmented({ value, options, onChange }: SegmentedProps) {
  return (
    <div className="segmented">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`seg-btn ${value === opt.value ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface SliderProps {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

function Slider({ label, hint, value, min, max, step, unit, onChange }: SliderProps) {
  return (
    <div className="field">
      <div className="field-head">
        <span className="field-label">{label}</span>
        <span className="field-value">
          {value}
          {unit}
        </span>
      </div>
      <input
        className="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
