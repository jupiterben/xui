export type XuiThemeInput = {
  name: string;
  accent: string;
  secondary: string;
  background: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  fontFamily: string;
  fontScale: number;
  radius: number;
  density: number;
  borderWidth: number;
  shadowStrength: number;
};

export type XuiThemeImage = {
  dataUrl?: string;
  url?: string;
  name?: string;
  type?: string;
};

export type XuiThemeGeneratorOptions = {
  image?: XuiThemeImage;
};

export type XuiThemeGenerator = (prompt: string, options?: XuiThemeGeneratorOptions) => XuiThemeInput | Promise<XuiThemeInput>;

export type XuiThemeVariables = {
  '--xui-bg': string;
  '--xui-surface': string;
  '--xui-surface-muted': string;
  '--xui-border': string;
  '--xui-text': string;
  '--xui-muted': string;
  '--xui-accent': string;
  '--xui-accent-contrast': string;
  '--xui-accent-soft': string;
  '--xui-secondary': string;
  '--xui-secondary-contrast': string;
  '--xui-error': string;
  '--xui-error-contrast': string;
  '--xui-error-soft': string;
  '--xui-warning': string;
  '--xui-warning-contrast': string;
  '--xui-warning-soft': string;
  '--xui-success': string;
  '--xui-success-contrast': string;
  '--xui-success-soft': string;
  '--xui-info': string;
  '--xui-info-contrast': string;
  '--xui-info-soft': string;
  '--xui-font-family': string;
  '--xui-font-size-xs': string;
  '--xui-font-size-sm': string;
  '--xui-font-size-base': string;
  '--xui-font-size-lg': string;
  '--xui-font-size-xl': string;
  '--xui-font-size-2xl': string;
  '--xui-font-size-3xl': string;
  '--xui-font-size-4xl': string;
  '--xui-line-height': string;
  '--xui-font-weight-normal': string;
  '--xui-font-weight-medium': string;
  '--xui-font-weight-semibold': string;
  '--xui-radius-sm': string;
  '--xui-radius-md': string;
  '--xui-radius-lg': string;
  '--xui-radius-xl': string;
  '--xui-radius-2xl': string;
  '--xui-radius-full': string;
  '--xui-space-1': string;
  '--xui-space-2': string;
  '--xui-space-3': string;
  '--xui-space-4': string;
  '--xui-space-5': string;
  '--xui-space-6': string;
  '--xui-border-width': string;
  '--xui-shadow-sm': string;
  '--xui-shadow-md': string;
  '--xui-shadow-lg': string;
  '--xui-focus-ring': string;
  '--xui-transition-fast': string;
  '--xui-transition-base': string;
};

export const defaultThemePresets: XuiThemeInput[] = [
  {
    name: 'Aurora',
    accent: '#38bdf8',
    secondary: '#22d3ee',
    background: '#020617',
    error: '#f43f5e',
    warning: '#f59e0b',
    success: '#22c55e',
    info: '#3b82f6',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontScale: 1,
    radius: 14,
    density: 1,
    borderWidth: 1,
    shadowStrength: 0.55
  },
  {
    name: 'Solar',
    accent: '#f59e0b',
    secondary: '#ef4444',
    background: '#111827',
    error: '#fb7185',
    warning: '#fbbf24',
    success: '#4ade80',
    info: '#60a5fa',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontScale: 1.02,
    radius: 10,
    density: 1.08,
    borderWidth: 1,
    shadowStrength: 0.5
  },
  {
    name: 'Studio',
    accent: '#8b5cf6',
    secondary: '#ec4899',
    background: '#18181b',
    error: '#f43f5e',
    warning: '#eab308',
    success: '#10b981',
    info: '#6366f1',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontScale: 0.98,
    radius: 18,
    density: 0.95,
    borderWidth: 1,
    shadowStrength: 0.7
  },
  {
    name: 'Paper',
    accent: '#2563eb',
    secondary: '#16a34a',
    background: '#f8fafc',
    error: '#dc2626',
    warning: '#d97706',
    success: '#15803d',
    info: '#2563eb',
    fontFamily: 'Georgia, ui-serif, serif',
    fontScale: 1.04,
    radius: 8,
    density: 1.12,
    borderWidth: 1,
    shadowStrength: 0.18
  }
];

export const themeJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'accent', 'secondary', 'background', 'error', 'warning', 'success', 'info', 'fontFamily', 'fontScale', 'radius', 'density', 'borderWidth', 'shadowStrength'],
  properties: {
    name: { type: 'string' },
    accent: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    secondary: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    background: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    error: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    warning: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    success: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    info: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    fontFamily: { type: 'string' },
    fontScale: { type: 'number', minimum: 0.86, maximum: 1.24 },
    radius: { type: 'number', minimum: 0, maximum: 28 },
    density: { type: 'number', minimum: 0.72, maximum: 1.35 },
    borderWidth: { type: 'number', minimum: 0, maximum: 3 },
    shadowStrength: { type: 'number', minimum: 0, maximum: 1 }
  }
} as const;

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
}

export function mixColor(from: string, to: string, amount: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);

  return rgbToHex(a.r + (b.r - a.r) * amount, a.g + (b.g - a.g) * amount, a.b + (b.b - a.b) * amount);
}

export function getColorLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function hash(value: string) {
  return [...value].reduce((result, char) => (result * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function hslToHex(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeThemeInput(value: unknown, fallback: XuiThemeInput = defaultThemePresets[0]): XuiThemeInput {
  const input = typeof value === 'object' && value ? (value as Partial<XuiThemeInput>) : {};

  return {
    name: typeof input.name === 'string' && input.name.trim() ? input.name : fallback.name,
    accent: isHexColor(input.accent) ? input.accent : fallback.accent,
    secondary: isHexColor(input.secondary) ? input.secondary : fallback.secondary,
    background: isHexColor(input.background) ? input.background : fallback.background,
    error: isHexColor(input.error) ? input.error : fallback.error,
    warning: isHexColor(input.warning) ? input.warning : fallback.warning,
    success: isHexColor(input.success) ? input.success : fallback.success,
    info: isHexColor(input.info) ? input.info : fallback.info,
    fontFamily: typeof input.fontFamily === 'string' && input.fontFamily.trim() ? input.fontFamily : fallback.fontFamily,
    fontScale: clamp(Number(input.fontScale ?? fallback.fontScale), 0.86, 1.24),
    radius: clamp(Number(input.radius ?? fallback.radius), 0, 28),
    density: clamp(Number(input.density ?? fallback.density), 0.72, 1.35),
    borderWidth: clamp(Number(input.borderWidth ?? fallback.borderWidth), 0, 3),
    shadowStrength: clamp(Number(input.shadowStrength ?? fallback.shadowStrength), 0, 1)
  };
}

export function generateThemeFromPrompt(prompt: string): XuiThemeInput {
  const seed = hash(prompt || 'xui');
  const hue = seed % 360;
  const secondaryHue = (hue + 55 + (seed % 80)) % 360;
  const dark = !/(light|paper|clean|bright|day|white)/i.test(prompt);
  const compact = /(compact|dense|data|table|dashboard|ops)/i.test(prompt);
  const soft = /(soft|friendly|round|playful|warm)/i.test(prompt);
  const editorial = /(editorial|serif|paper|magazine|docs|writing)/i.test(prompt);

  return {
    name: 'Generated',
    accent: hslToHex(hue, 0.72, dark ? 0.56 : 0.44),
    secondary: hslToHex(secondaryHue, 0.68, dark ? 0.58 : 0.42),
    background: hslToHex((hue + 220) % 360, dark ? 0.42 : 0.28, dark ? 0.08 : 0.96),
    error: dark ? '#f43f5e' : '#dc2626',
    warning: dark ? '#f59e0b' : '#d97706',
    success: dark ? '#22c55e' : '#15803d',
    info: dark ? '#3b82f6' : '#2563eb',
    fontFamily: editorial ? 'Georgia, ui-serif, serif' : 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontScale: editorial ? 1.04 : compact ? 0.96 : 1,
    radius: soft ? 18 : compact ? 8 : 12,
    density: compact ? 0.86 : soft ? 1.08 : 1,
    borderWidth: compact ? 1 : 1,
    shadowStrength: dark ? 0.62 : 0.22
  };
}

function scalePx(value: number, scale: number) {
  return `${Number((value * scale).toFixed(2))}px`;
}

function shadow(alpha: number, y: number, blur: number, spread = 0) {
  return `0 ${y}px ${blur}px ${spread}px rgb(2 6 23 / ${alpha})`;
}

export function resolveThemeVariables(theme: XuiThemeInput): XuiThemeVariables {
  const dark = getColorLuminance(theme.background) < 0.45;
  const text = dark ? '#f8fafc' : '#0f172a';
  const shadowBase = Math.max(0, Math.min(1, theme.shadowStrength));
  const density = Math.max(0.72, Math.min(1.35, theme.density));
  const radius = Math.max(0, theme.radius);
  const fontScale = Math.max(0.86, Math.min(1.24, theme.fontScale));

  return {
    '--xui-bg': theme.background,
    '--xui-surface': mixColor(theme.background, dark ? '#ffffff' : '#000000', 0.08),
    '--xui-surface-muted': mixColor(theme.background, dark ? '#ffffff' : '#000000', 0.14),
    '--xui-border': mixColor(theme.background, dark ? '#ffffff' : '#000000', 0.2),
    '--xui-text': text,
    '--xui-muted': mixColor(text, theme.background, 0.42),
    '--xui-accent': theme.accent,
    '--xui-accent-contrast': getColorLuminance(theme.accent) > 0.55 ? '#0f172a' : '#ffffff',
    '--xui-accent-soft': mixColor(theme.accent, theme.background, 0.72),
    '--xui-secondary': theme.secondary,
    '--xui-secondary-contrast': getColorLuminance(theme.secondary) > 0.55 ? '#0f172a' : '#ffffff',
    '--xui-error': theme.error,
    '--xui-error-contrast': getColorLuminance(theme.error) > 0.55 ? '#0f172a' : '#ffffff',
    '--xui-error-soft': mixColor(theme.error, theme.background, 0.72),
    '--xui-warning': theme.warning,
    '--xui-warning-contrast': getColorLuminance(theme.warning) > 0.55 ? '#0f172a' : '#ffffff',
    '--xui-warning-soft': mixColor(theme.warning, theme.background, 0.72),
    '--xui-success': theme.success,
    '--xui-success-contrast': getColorLuminance(theme.success) > 0.55 ? '#0f172a' : '#ffffff',
    '--xui-success-soft': mixColor(theme.success, theme.background, 0.72),
    '--xui-info': theme.info,
    '--xui-info-contrast': getColorLuminance(theme.info) > 0.55 ? '#0f172a' : '#ffffff',
    '--xui-info-soft': mixColor(theme.info, theme.background, 0.72),
    '--xui-font-family': theme.fontFamily,
    '--xui-font-size-xs': `${0.75 * fontScale}rem`,
    '--xui-font-size-sm': `${0.875 * fontScale}rem`,
    '--xui-font-size-base': `${1 * fontScale}rem`,
    '--xui-font-size-lg': `${1.125 * fontScale}rem`,
    '--xui-font-size-xl': `${1.25 * fontScale}rem`,
    '--xui-font-size-2xl': `${1.5 * fontScale}rem`,
    '--xui-font-size-3xl': `${1.875 * fontScale}rem`,
    '--xui-font-size-4xl': `${2.25 * fontScale}rem`,
    '--xui-line-height': fontScale > 1.08 ? '1.65' : '1.5',
    '--xui-font-weight-normal': '400',
    '--xui-font-weight-medium': '500',
    '--xui-font-weight-semibold': '650',
    '--xui-radius-sm': scalePx(radius, 0.35),
    '--xui-radius-md': scalePx(radius, 0.55),
    '--xui-radius-lg': scalePx(radius, 0.75),
    '--xui-radius-xl': scalePx(radius, 1),
    '--xui-radius-2xl': scalePx(radius, 1.35),
    '--xui-radius-full': '999px',
    '--xui-space-1': scalePx(4, density),
    '--xui-space-2': scalePx(8, density),
    '--xui-space-3': scalePx(12, density),
    '--xui-space-4': scalePx(16, density),
    '--xui-space-5': scalePx(20, density),
    '--xui-space-6': scalePx(24, density),
    '--xui-border-width': `${theme.borderWidth}px`,
    '--xui-shadow-sm': shadow(0.12 * shadowBase, 1, 2),
    '--xui-shadow-md': shadow(0.18 * shadowBase, 8, 24, -8),
    '--xui-shadow-lg': shadow(0.24 * shadowBase, 18, 48, -18),
    '--xui-focus-ring': `0 0 0 3px ${mixColor(theme.accent, theme.background, 0.35)}`,
    '--xui-transition-fast': '120ms ease',
    '--xui-transition-base': '180ms ease'
  };
}

export function applyThemeVariables(style: CSSStyleDeclaration, theme: XuiThemeInput) {
  const variables = resolveThemeVariables(theme);

  for (const [name, value] of Object.entries(variables)) {
    style.setProperty(name, value);
  }

  return variables;
}
