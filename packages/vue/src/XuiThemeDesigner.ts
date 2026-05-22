import {
  applyThemeVariables,
  defaultThemePresets,
  generateThemeFromPrompt,
  type XuiThemeGenerator,
  type XuiThemeImage,
  type XuiThemeInput
} from '@xui/core';
import { type PropType, defineComponent, h, reactive, ref, watchEffect } from 'vue';

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
  image: '参考图片',
  imageUrl: '图片 URL',
  imageUrlPlaceholder: '粘贴图片 URL 或上传图片',
  imageSelected: '已选择',
  imageRemove: '移除图片',
  promptPlaceholder: '例如：warm fintech, forest data tool, paper clean'
};

const fontOptions = [
  { label: 'Sans', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, ui-serif, serif' },
  { label: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
  { label: 'System', value: 'ui-sans-serif, system-ui, sans-serif' }
];

type ColorThemeKey = 'accent' | 'secondary' | 'background' | 'error' | 'warning' | 'success' | 'info';
type NumberThemeKey = 'fontScale' | 'radius' | 'density' | 'borderWidth' | 'shadowStrength';

function isRemoteImageUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

export const XuiThemeDesigner = defineComponent({
  name: 'XuiThemeDesigner',
  props: {
    initialPrompt: { type: String, default: 'calm productive dashboard' },
    initialTheme: { type: Object as PropType<XuiThemeInput>, default: () => defaultThemePresets[0] },
    labels: { type: Object as PropType<Partial<typeof defaultLabels>>, default: () => ({}) },
    presets: { type: Array as PropType<XuiThemeInput[]>, default: () => defaultThemePresets },
    target: { type: Object as PropType<HTMLElement>, default: undefined },
    themeGenerator: { type: Function as PropType<XuiThemeGenerator>, default: undefined }
  },
  emits: {
    themeChange: (_theme: XuiThemeInput) => true
  },
  setup(props, { attrs, emit }) {
    const prompt = ref(props.initialPrompt);
    const theme = reactive<XuiThemeInput>({ ...props.initialTheme });
    const themeImage = ref<XuiThemeImage | undefined>();
    const imageUrl = ref('');
    const isGenerating = ref(false);
    const generationError = ref<string | undefined>();

    function setTheme(next: XuiThemeInput) {
      theme.name = next.name;
      theme.accent = next.accent;
      theme.secondary = next.secondary;
      theme.background = next.background;
      theme.error = next.error;
      theme.warning = next.warning;
      theme.success = next.success;
      theme.info = next.info;
      theme.fontFamily = next.fontFamily;
      theme.fontScale = next.fontScale;
      theme.radius = next.radius;
      theme.density = next.density;
      theme.borderWidth = next.borderWidth;
      theme.shadowStrength = next.shadowStrength;
    }

    function setColorToken(key: ColorThemeKey, value: string) {
      theme[key] = value;
    }

    function setNumberToken(key: NumberThemeKey, value: number) {
      theme[key] = value;
    }

    watchEffect(() => {
      const element = props.target ?? (typeof document === 'undefined' ? undefined : document.documentElement);
      if (!element) {
        return;
      }

      const next = { ...theme };
      applyThemeVariables(element.style, next);
      emit('themeChange', next);
    });

    async function generateTheme(labels: typeof defaultLabels) {
      isGenerating.value = true;
      generationError.value = undefined;
      const imageFromUrl = imageUrl.value.trim() && isRemoteImageUrl(imageUrl.value) ? { url: imageUrl.value.trim(), name: imageUrl.value.trim() } : undefined;
      const currentImage = themeImage.value ?? imageFromUrl;

      try {
        setTheme(await (props.themeGenerator ? props.themeGenerator(prompt.value, { image: currentImage }) : generateThemeFromPrompt(prompt.value)));
      } catch {
        setTheme(generateThemeFromPrompt(prompt.value));
        generationError.value = labels.fallbackNotice;
      } finally {
        isGenerating.value = false;
      }
    }

    function readImage(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          themeImage.value = { dataUrl: reader.result, name: file.name, type: file.type };
          imageUrl.value = '';
        }
      });
      reader.readAsDataURL(file);
    }

    function readPromptPaste(event: ClipboardEvent) {
      const value = event.clipboardData?.getData('text').trim();
      if (value && isRemoteImageUrl(value)) {
        event.preventDefault();
        themeImage.value = undefined;
        imageUrl.value = value;
      }
    }

    return () => {
      const labels = { ...defaultLabels, ...props.labels };
      const imageFromUrl = imageUrl.value.trim() && isRemoteImageUrl(imageUrl.value) ? { url: imageUrl.value.trim(), name: imageUrl.value.trim() } : undefined;
      const currentImage = themeImage.value ?? imageFromUrl;

      return h('section', attrs, [
        h('div', { class: 'flex flex-wrap items-start justify-between gap-[var(--xui-space-4)]' }, [
          h('div', [
            h('p', { class: 'text-xs font-medium uppercase tracking-[0.24em] text-[var(--xui-accent)]' }, labels.eyebrow),
            h('h2', { class: 'mt-2 text-xl font-semibold' }, labels.title),
            h('p', { class: 'mt-2 text-sm text-[var(--xui-muted)]' }, labels.description)
          ]),
          h(
            'div',
            { class: 'flex flex-wrap gap-[var(--xui-space-2)]' },
            props.presets.map((preset) =>
              h(
                'button',
                {
                  key: preset.name,
                  class:
                    'rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] px-[var(--xui-space-3)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] hover:bg-[var(--xui-surface-muted)] focus:shadow-[var(--xui-focus-ring)]',
                  type: 'button',
                  onClick: () => setTheme(preset)
                },
                preset.name
              )
            )
          )
        ]),
        h(
          'div',
          { class: 'mt-5 grid gap-[var(--xui-space-4)] md:grid-cols-3' },
          [
            [labels.accent, 'accent'],
            [labels.secondary, 'secondary'],
            [labels.background, 'background']
          ].map(([label, key]) =>
            h('label', { key, class: 'text-sm' }, [
              h('span', { class: 'block text-[var(--xui-muted)]' }, label),
              h('input', {
                class:
                  'mt-[var(--xui-space-2)] h-10 w-full rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-transparent p-1',
                type: 'color',
                value: theme[key as ColorThemeKey],
                onInput: (event: Event) => {
                  setColorToken(key as ColorThemeKey, (event.target as HTMLInputElement).value);
                }
              })
            ])
          )
        ),
        h(
          'div',
          { class: 'mt-[var(--xui-space-4)] grid gap-[var(--xui-space-4)] md:grid-cols-4' },
          [
            [labels.error, 'error'],
            [labels.warning, 'warning'],
            [labels.success, 'success'],
            [labels.info, 'info']
          ].map(([label, key]) =>
            h('label', { key, class: 'text-sm' }, [
              h('span', { class: 'block text-[var(--xui-muted)]' }, label),
              h('input', {
                class:
                  'mt-[var(--xui-space-2)] h-10 w-full rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-transparent p-1',
                type: 'color',
                value: theme[key as ColorThemeKey],
                onInput: (event: Event) => {
                  setColorToken(key as ColorThemeKey, (event.target as HTMLInputElement).value);
                }
              })
            ])
          )
        ),
        h('div', { class: 'mt-[var(--xui-space-5)] grid gap-[var(--xui-space-4)] md:grid-cols-3' }, [
          h('label', { class: 'text-sm' }, [
            h('span', { class: 'block text-[var(--xui-muted)]' }, labels.fontFamily),
            h(
              'select',
              {
                class:
                  'mt-[var(--xui-space-2)] h-10 w-full rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-bg)] px-[var(--xui-space-3)] text-[length:var(--xui-font-size-sm)]',
                value: theme.fontFamily,
                onChange: (event: Event) => {
                  theme.fontFamily = (event.target as HTMLSelectElement).value;
                }
              },
              fontOptions.map((option) => h('option', { key: option.value, value: option.value }, option.label))
            )
          ]),
          ...[
            [labels.fontScale, 'fontScale', 0.86, 1.24, 0.01],
            [labels.radius, 'radius', 0, 28, 1],
            [labels.density, 'density', 0.72, 1.35, 0.01],
            [labels.borderWidth, 'borderWidth', 0, 3, 1],
            [labels.shadowStrength, 'shadowStrength', 0, 1, 0.01]
          ].map(([label, key, min, max, step]) =>
            h('label', { key, class: 'text-sm' }, [
              h('span', { class: 'flex justify-between text-[var(--xui-muted)]' }, [
                h('span', label),
                h('span', Number(theme[key as keyof XuiThemeInput]).toFixed(key === 'radius' || key === 'borderWidth' ? 0 : 2))
              ]),
              h('input', {
                class: 'mt-3 w-full accent-[var(--xui-accent)]',
                type: 'range',
                min,
                max,
                step,
                value: theme[key as keyof XuiThemeInput],
                onInput: (event: Event) => {
                  setNumberToken(key as NumberThemeKey, Number((event.target as HTMLInputElement).value));
                }
              })
            ])
          )
        ]),
        h('div', { class: 'mt-[var(--xui-space-5)] flex flex-col gap-[var(--xui-space-3)] sm:flex-row' }, [
          h('input', {
            class:
              'min-w-0 flex-1 rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-bg)] px-[var(--xui-space-3)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] outline-none focus:border-[var(--xui-accent)] focus:shadow-[var(--xui-focus-ring)]',
            placeholder: labels.promptPlaceholder,
            value: prompt.value,
            onPaste: readPromptPaste,
            onInput: (event: Event) => {
              prompt.value = (event.target as HTMLInputElement).value;
            }
          }),
          h(
            'label',
            {
              class:
                'inline-flex cursor-pointer items-center justify-center rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] px-[var(--xui-space-4)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] hover:bg-[var(--xui-surface-muted)]'
            },
            [
              h('span', labels.image),
              h('input', {
                class: 'sr-only',
                type: 'file',
                accept: 'image/png,image/jpeg,image/webp',
                onChange: readImage
              })
            ]
          ),
          h(
            'button',
            {
              class:
                'rounded-[var(--xui-radius-lg)] bg-[var(--xui-accent)] px-[var(--xui-space-4)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] font-medium text-[var(--xui-accent-contrast)] shadow-[var(--xui-shadow-sm)] disabled:cursor-not-allowed disabled:opacity-60',
              disabled: isGenerating.value,
              type: 'button',
              onClick: () => generateTheme(labels)
            },
            isGenerating.value ? labels.generating : labels.generate
          )
        ]),
        h('label', { class: 'mt-[var(--xui-space-3)] block text-[length:var(--xui-font-size-sm)]' }, [
          h('span', { class: 'block text-[var(--xui-muted)]' }, labels.imageUrl),
          h('input', {
            class:
              'mt-[var(--xui-space-2)] w-full rounded-[var(--xui-radius-lg)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] bg-[var(--xui-bg)] px-[var(--xui-space-3)] py-[var(--xui-space-2)] text-[length:var(--xui-font-size-sm)] outline-none focus:border-[var(--xui-accent)] focus:shadow-[var(--xui-focus-ring)]',
            placeholder: labels.imageUrlPlaceholder,
            value: imageUrl.value,
            onInput: (event: Event) => {
              imageUrl.value = (event.target as HTMLInputElement).value;
              if (imageUrl.value.trim()) {
                themeImage.value = undefined;
              }
            }
          })
        ]),
        currentImage
          ? h('div', { class: 'mt-[var(--xui-space-3)] flex flex-wrap items-center gap-[var(--xui-space-3)] text-[length:var(--xui-font-size-xs)] text-[var(--xui-muted)]' }, [
              h('span', `${labels.imageSelected}: ${currentImage.name ?? currentImage.url ?? 'image'}`),
              h(
                'button',
                {
                  class:
                    'rounded-[var(--xui-radius-md)] border-[length:var(--xui-border-width)] border-[var(--xui-border)] px-[var(--xui-space-2)] py-[var(--xui-space-1)] hover:bg-[var(--xui-surface-muted)]',
                  type: 'button',
                  onClick: () => {
                    themeImage.value = undefined;
                    imageUrl.value = '';
                  }
                },
                labels.imageRemove
              )
            ])
          : null,
        generationError.value
          ? h('p', { class: 'mt-[var(--xui-space-3)] text-[length:var(--xui-font-size-xs)] text-[var(--xui-muted)]' }, generationError.value)
          : null
      ]);
    };
  }
});
