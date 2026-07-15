import { defaultThemePresets, resolveThemeVariables, type xComponentSize, type xConfig, type xDirection } from '@xui/core';
import { type CSSProperties, type InjectionKey, type PropType, defineComponent, h, inject, provide, reactive, watchEffect } from 'vue';

type xConfigContextValue = Required<Pick<xConfig, 'componentSize' | 'direction' | 'prefixCls'>> & {
  theme: xConfig['theme'];
};

const defaultConfig: xConfigContextValue = {
  componentSize: 'middle',
  direction: 'ltr',
  prefixCls: 'xui',
  theme: defaultThemePresets[0]
};

const xuiConfigKey: InjectionKey<xConfigContextValue> = Symbol('xui-config');

export function useXConfig() {
  return inject(xuiConfigKey, defaultConfig);
}

export const xConfigProvider = defineComponent({
  name: 'xConfigProvider',
  props: {
    componentSize: { type: String as PropType<xComponentSize>, default: defaultConfig.componentSize },
    direction: { type: String as PropType<xDirection>, default: defaultConfig.direction },
    prefixCls: { type: String, default: defaultConfig.prefixCls },
    theme: { type: Object as PropType<xConfig['theme']>, default: () => defaultConfig.theme }
  },
  setup(props, { attrs, slots }) {
    const context = reactive<xConfigContextValue>({ ...defaultConfig });

    watchEffect(() => {
      context.componentSize = props.componentSize;
      context.direction = props.direction;
      context.prefixCls = props.prefixCls;
      context.theme = props.theme;
    });

    provide(xuiConfigKey, context);

    return () => {
      const variables = resolveThemeVariables(props.theme ?? defaultThemePresets[0]) as CSSProperties;
      const className = ['xui-config-provider', attrs.class].filter(Boolean).join(' ');

      return h(
        'div',
        {
          ...attrs,
          class: className,
          'data-component-size': props.componentSize,
          dir: props.direction,
          style: {
            ...variables,
            ...(attrs.style as CSSProperties | undefined)
          }
        },
        slots.default?.()
      );
    };
  }
});
