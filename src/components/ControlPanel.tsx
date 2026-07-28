import type { ReactNode } from 'react';
import { t, type MessageKey } from '../i18n';
import type { Clustering, Hierarchical, PathMode, VTracerConfig } from '../lib/vtracer';
import { PRESETS, type Preset, type PresetId } from '../lib/presets';
import { Segmented } from './Segmented';

interface ControlPanelProps {
  config: VTracerConfig;
  onChange: (partial: Partial<VTracerConfig>) => void;
  onPreset: (preset: Preset) => void;
  activePresetId: string | null;
}

export function ControlPanel({ config, onChange, onPreset, activePresetId }: ControlPanelProps) {
  const isColorCluster = config.clustering === 'color-cluster';
  const isWatershed = config.clustering === 'watershed';
  const isBinary = config.clustering === 'bw';
  const isSpline = config.mode === 'spline';
  const showHierarchy = !isBinary;

  const presetName = (id: PresetId) => t(`presets.${id}.name` as MessageKey);
  const presetDesc = (id: PresetId) => t(`presets.${id}.description` as MessageKey);

  return (
    <aside className="panel">
      <section className="panel-section">
        <h3>{t('controls.presets')}</h3>
        <div className="preset-grid">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`preset-btn ${activePresetId === p.id ? 'is-active' : ''}`}
              onClick={() => onPreset(p)}
              title={presetDesc(p.id)}
            >
              {presetName(p.id)}
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>{t('controls.clustering')}</h3>

        <Field
          label={t('controls.clusteringMode')}
          hint={
            isWatershed
              ? t('controls.watershedHint')
              : isBinary
                ? t('controls.binaryHint')
                : t('controls.colorHint')
          }
        >
          <Segmented
            value={config.clustering}
            options={[
              { value: 'color-cluster', label: t('controls.clusteringColor') },
              { value: 'bw', label: t('controls.clusteringBinary') },
              { value: 'watershed', label: t('controls.clusteringWatershed') },
            ]}
            onChange={(v) => onChange({ clustering: v as Clustering })}
          />
        </Field>

        {showHierarchy && (
          <Field
            label={t('controls.hierarchy')}
            hint={
              config.hierarchical === 'stacked'
                ? t('controls.stackedHint')
                : t('controls.cutoutHint')
            }
          >
            <Segmented
              value={config.hierarchical}
              options={[
                { value: 'stacked', label: t('controls.hierarchyStacked') },
                { value: 'cutout', label: t('controls.hierarchyCutout') },
              ]}
              onChange={(v) => onChange({ hierarchical: v as Hierarchical })}
            />
          </Field>
        )}

        <Slider
          label={t('controls.filterSpeckle')}
          hint={t('controls.filterSpeckleHint')}
          value={config.filter_speckle}
          min={0}
          max={128}
          step={1}
          onChange={(v) => onChange({ filter_speckle: v })}
        />

        {isColorCluster && (
          <>
            <Slider
              label={t('controls.colorPrecision')}
              hint={t('controls.colorPrecisionHint')}
              value={config.color_precision}
              min={1}
              max={8}
              step={1}
              onChange={(v) => onChange({ color_precision: v })}
            />
            <Slider
              label={t('controls.gradientStep')}
              hint={t('controls.gradientStepHint')}
              value={config.layer_difference}
              min={0}
              max={255}
              step={1}
              onChange={(v) => onChange({ layer_difference: v })}
            />
          </>
        )}

        {isWatershed && (
          <Slider
            label={t('controls.watershedDetail')}
            hint={t('controls.watershedDetailHint')}
            value={config.watershed_detail}
            min={0}
            max={255}
            step={1}
            onChange={(v) => onChange({ watershed_detail: v })}
          />
        )}
      </section>

      <section className="panel-section">
        <h3>{t('controls.curveFitting')}</h3>

        <Field label={t('controls.mode')}>
          <Segmented
            value={config.mode}
            options={[
              { value: 'spline', label: t('controls.modeSpline') },
              { value: 'polygon', label: t('controls.modePolygon') },
              { value: 'pixel', label: t('controls.modePixel') },
            ]}
            onChange={(v) => onChange({ mode: v as PathMode })}
          />
        </Field>

        {isSpline && (
          <Slider
            label={t('controls.simplify')}
            hint={t('controls.simplifyHint')}
            value={config.simplify ?? 0}
            min={0}
            max={4}
            step={0.5}
            unit="px"
            onChange={(v) => onChange({ simplify: v <= 0 ? null : v })}
          />
        )}
      </section>

      <section className="panel-section">
        <Slider
          label={t('controls.pathPrecision')}
          hint={t('controls.pathPrecisionHint')}
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
  const fill = ((value - min) / (max - min)) * 100;
  const display =
    step < 1 && value !== 0 && value % 1 !== 0 ? value.toFixed(1) : String(value);
  return (
    <div className="field">
      <div className="field-head">
        <span className="field-label">{label}</span>
        <span className="field-value">
          {value <= 0 && unit === 'px' ? 'off' : `${display}${unit ?? ''}`}
        </span>
      </div>
      <input
        className="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ['--fill' as string]: `${fill}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
