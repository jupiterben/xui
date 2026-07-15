import * as React from 'react';
import {
  applyThemeVariables,
  defaultThemePresets,
  generateThemeFromPrompt,
  type xThemeGenerator,
  type xThemeInput
} from '@xui/core';
import { x } from '../x';
import type { xPromptInputHandle } from './xPromptInput';

type ColorThemeKey = 'accent' | 'secondary' | 'background' | 'error' | 'warning' | 'success' | 'info';
type NumberThemeKey = 'fontScale' | 'radius' | 'density' | 'borderWidth' | 'shadowStrength';

type xThemeDesignerProps = Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> & {
  initialPrompt?: string;
  initialTheme?: xThemeInput;
  labels?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    accent?: string;
    secondary?: string;
    background?: string;
    error?: string;
    warning?: string;
    success?: string;
    info?: string;
    fontFamily?: string;
    fontScale?: string;
    radius?: string;
    density?: string;
    borderWidth?: string;
    shadowStrength?: string;
    generate?: string;
    generating?: string;
    fallbackNotice?: string;
    promptPlaceholder?: string;
  };
  onThemeChange?: (theme: xThemeInput) => void;
  presets?: xThemeInput[];
  target?: HTMLElement;
  themeGenerator?: xThemeGenerator;
};

const defaultLabels = {
  eyebrow: 'Theme',
  title: '自定义颜色系',
  description: '选择预设、手动调色，或用提示词生成一套主题变量。',
  accent: '主色',
  secondary: '辅色',
  background: '背景',
  error: '错误',
  warning: '警告',
  success: '成功',
  info: '信息',
  fontFamily: '字体',
  fontScale: '字号',
  radius: '圆角',
  density: '密度',
  borderWidth: '边框',
  shadowStrength: '阴影',
  generate: '生成主题',
  generating: '生成中...',
  fallbackNotice: '模型生成失败，已使用本地生成结果。',
  promptPlaceholder: '描述你想要的主题风格，可粘贴或拖入参考图...'
};

const fontOptions = [
  { label: 'Sans', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, ui-serif, serif' },
  { label: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
  { label: 'System', value: 'ui-sans-serif, system-ui, sans-serif' }
];

export function xThemeDesigner({
  initialPrompt = 'calm productive dashboard',
  initialTheme = defaultThemePresets[0],
  labels,
  onThemeChange,
  presets = defaultThemePresets,
  target,
  themeGenerator,
  ...props
}: xThemeDesignerProps) {
  const [theme, setTheme] = React.useState<xThemeInput>(initialTheme);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationError, setGenerationError] = React.useState<string | undefined>();
  const promptInputRef = React.useRef<xPromptInputHandle>(null);
  const text = { ...defaultLabels, ...labels };

  React.useEffect(() => {
    if (target) {
      applyThemeVariables(target.style, theme);
    }
    onThemeChange?.(theme);
  }, [onThemeChange, target, theme]);

  const handleGenerate = async () => {
    const prompt = promptInputRef.current?.getPrompt() ?? initialPrompt;
    const currentImage = promptInputRef.current?.getImage();

    setIsGenerating(true);
    setGenerationError(undefined);

    try {
      setTheme(await (themeGenerator ? themeGenerator(prompt, { image: currentImage }) : generateThemeFromPrompt(prompt)));
    } catch {
      setTheme(generateThemeFromPrompt(prompt));
      setGenerationError(text.fallbackNotice);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!isGenerating) {
      handleGenerate();
    }
  };

  return (
    <section {...props}>
      <div className="flex flex-wrap items-start justify-between gap-[var(--xui-space-4)]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]">{text.eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold">{text.title}</h2>
          <p className="mt-2 text-sm text-[var(--xui-muted)]">{text.description}</p>
        </div>
        <div className="flex flex-wrap gap-[var(--xui-space-2)]">
          {presets.map((preset) => (
            <button
              key={preset.name}
              className="rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] px-[var(--xui-space-3)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] hover:bg-[var(--xui-surface-muted)] focus:shadow-[var(--xui-focus-ring)]"
              type="button"
              onClick={() => setTheme(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-[var(--xui-space-4)] md:grid-cols-3">
        {[
          [text.accent, 'accent'],
          [text.secondary, 'secondary'],
          [text.background, 'background']
        ].map(([label, key]) => (
          <label key={key} className="text-sm">
            <span className="block text-[var(--xui-muted)]">{label}</span>
            <input
              className="mt-[var(--xui-space-2)] h-10 w-full rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-transparent p-1"
              type="color"
              value={theme[key as ColorThemeKey]}
              onChange={(event) => setTheme((current) => ({ ...current, [key]: event.target.value }))}
            />
          </label>
        ))}
      </div>

      <div className="mt-[var(--xui-space-4)] grid gap-[var(--xui-space-4)] md:grid-cols-4">
        {[
          [text.error, 'error'],
          [text.warning, 'warning'],
          [text.success, 'success'],
          [text.info, 'info']
        ].map(([label, key]) => (
          <label key={key} className="text-sm">
            <span className="block text-[var(--xui-muted)]">{label}</span>
            <input
              className="mt-[var(--xui-space-2)] h-10 w-full rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-transparent p-1"
              type="color"
              value={theme[key as ColorThemeKey]}
              onChange={(event) => setTheme((current) => ({ ...current, [key]: event.target.value }))}
            />
          </label>
        ))}
      </div>

      <div className="mt-[var(--xui-space-5)] grid gap-[var(--xui-space-4)] md:grid-cols-3">
        <label className="text-sm">
          <span className="block text-[var(--xui-muted)]">{text.fontFamily}</span>
          <select
            className="mt-[var(--xui-space-2)] h-10 w-full rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-bg)] px-[var(--xui-space-3)] text-[length:var(--xui-font-size-sm)]"
            value={theme.fontFamily}
            onChange={(event) => setTheme((current) => ({ ...current, fontFamily: event.target.value }))}
          >
            {fontOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {[
          [text.fontScale, 'fontScale', 0.86, 1.24, 0.01],
          [text.radius, 'radius', 0, 28, 1],
          [text.density, 'density', 0.72, 1.35, 0.01],
          [text.borderWidth, 'borderWidth', 0, 3, 1],
          [text.shadowStrength, 'shadowStrength', 0, 1, 0.01]
        ].map(([label, key, min, max, step]) => (
          <label key={key} className="text-sm">
            <span className="flex justify-between text-[var(--xui-muted)]">
              <span>{label}</span>
              <span>{theme[key as NumberThemeKey].toFixed(key === 'radius' || key === 'borderWidth' ? 0 : 2)}</span>
            </span>
            <input
              className="mt-3 w-full accent-[var(--xui-accent)]"
              type="range"
              min={min as number}
              max={max as number}
              step={step as number}
              value={theme[key as NumberThemeKey]}
              onChange={(event) => setTheme((current) => ({ ...current, [key]: Number(event.target.value) }))}
            />
          </label>
        ))}
      </div>

      <div className="mt-[var(--xui-space-5)] flex flex-col gap-[var(--xui-space-3)] sm:flex-row sm:items-end">
        <x.PromptInput
          ref={promptInputRef}
          className="min-w-0 flex-1"
          defaultPrompt={initialPrompt}
          disabled={isGenerating}
          labels={{ placeholder: text.promptPlaceholder }}
          onSubmit={handleSubmit}
        />
        <button
          className="shrink-0 rounded-[var(--xui-radius-lg)] bg-[var(--xui-accent)] px-[var(--xui-space-4)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] font-medium text-[var(--xui-accent-contrast)] shadow-[var(--xui-shadow-sm)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isGenerating}
          type="button"
          onClick={handleGenerate}
        >
          {isGenerating ? text.generating : text.generate}
        </button>
      </div>
      {generationError ? <p className="mt-[var(--xui-space-3)] text-[length:var(--xui-font-size-xs)] text-[var(--xui-muted)]">{generationError}</p> : null}
    </section>
  );
}

