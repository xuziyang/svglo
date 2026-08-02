import { useId, useState, type ReactNode } from 'react';
import { t, type MessageKey } from '../i18n';
import type { ColorMode, Hierarchical, PathMode, VTracerConfig } from '../lib/vtracer';
import { PRESETS, type Preset, type PresetId } from '../lib/presets';
import { Segmented } from './Segmented';

interface ControlPanelProps {
  config: VTracerConfig;
  onChange: (partial: Partial<VTracerConfig>) => void;
  onPreset: (preset: Preset) => void;
  selectedPresetId: PresetId;
  isCustomized: boolean;
  onResetPreset: () => void;
}

export function ControlPanel({
  config,
  onChange,
  onPreset,
  selectedPresetId,
  isCustomized,
  onResetPreset,
}: ControlPanelProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const advancedId = useId();
  const isColor = config.colormode === 'color';
  const isSpline = config.mode === 'spline';

  const presetName = (id: PresetId) => t(`presets.${id}.name` as MessageKey);
  const presetDesc = (id: PresetId) => t(`presets.${id}.description` as MessageKey);

  return (
    <aside className="panel">
      <section className="panel-section preset-section">
        <div className="preset-heading">
          <div>
            <h3>{t('controls.presets')}</h3>
            <p className="preset-guide">{t('controls.presetGuide')}</p>
          </div>
          {isCustomized && <span className="preset-adjusted">{t('controls.adjusted')}</span>}
        </div>
        <div className="preset-grid">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`preset-btn ${selectedPresetId === p.id ? 'is-active' : ''}`}
              onClick={() => onPreset(p)}
              title={presetDesc(p.id)}
              aria-pressed={selectedPresetId === p.id}
            >
              {presetName(p.id)}
            </button>
          ))}
        </div>
        <p className="preset-description">
          <strong>{presetName(selectedPresetId)}</strong>
          <span>{presetDesc(selectedPresetId)}</span>
        </p>
        {isCustomized && (
          <button className="preset-reset" type="button" onClick={onResetPreset}>
            {t('controls.resetPreset')}
          </button>
        )}
      </section>

      <button
        className="advanced-toggle"
        type="button"
        aria-expanded={isAdvancedOpen}
        aria-controls={advancedId}
        onClick={() => setIsAdvancedOpen((open) => !open)}
      >
        <span>
          <strong>{t('controls.advancedSettings')}</strong>
          <small>{t('controls.optional')}</small>
        </span>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>

      {isAdvancedOpen && (
        <div id={advancedId} className="advanced-content">
          <section className="panel-section">
            <h3>{t('controls.clustering')}</h3>

            <Field
              label={t('controls.colorMode')}
              hint={isColor ? t('controls.colorHint') : t('controls.binaryHint')}
            >
              <Segmented
                value={config.colormode}
                options={[
                  { value: 'color', label: t('controls.colorModeColor') },
                  { value: 'binary', label: t('controls.colorModeBinary') },
                ]}
                onChange={(v) => onChange({ colormode: v as ColorMode })}
              />
            </Field>

            {isColor && (
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
              max={16}
              step={1}
              onChange={(v) => onChange({ filter_speckle: v })}
            />

            {isColor && (
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
          </section>

          <section className="panel-section">
            <h3>{t('controls.curveFitting')}</h3>

            <Field label={t('controls.mode')}>
              <Segmented
                value={config.mode}
                options={[
                  { value: 'spline', label: t('controls.modeSpline') },
                  { value: 'polygon', label: t('controls.modePolygon') },
                  { value: 'none', label: t('controls.modePixel') },
                ]}
                onChange={(v) => onChange({ mode: v as PathMode })}
              />
            </Field>

            {isSpline && (
              <>
                <Slider
                  label={t('controls.cornerThreshold')}
                  hint={t('controls.cornerThresholdHint')}
                  value={config.corner_threshold}
                  min={0}
                  max={180}
                  step={1}
                  unit="°"
                  onChange={(v) => onChange({ corner_threshold: v })}
                />
                <Slider
                  label={t('controls.segmentLength')}
                  hint={t('controls.segmentLengthHint')}
                  value={config.length_threshold}
                  min={3.5}
                  max={10}
                  step={0.5}
                  onChange={(v) => onChange({ length_threshold: v })}
                />
                <Slider
                  label={t('controls.spliceThreshold')}
                  hint={t('controls.spliceThresholdHint')}
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
              label={t('controls.pathPrecision')}
              hint={t('controls.pathPrecisionHint')}
              value={config.path_precision}
              min={0}
              max={16}
              step={1}
              onChange={(v) => onChange({ path_precision: v })}
            />
          </section>
        </div>
      )}
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
  const inputId = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="field">
      <div className="field-head">
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
        <span className="field-value">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={inputId}
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
