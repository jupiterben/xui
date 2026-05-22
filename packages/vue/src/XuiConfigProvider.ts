import { defaultThemePresets, resolveThemeVariables, type XuiComponentSize, type XuiConfig, type XuiDirection } from '@xui/core';
import { type CSSProperties, type InjectionKey, type PropType, defineComponent, h, inject, provide, reactive, watchEffect } from 'vue';

type XuiConfigContextValue = Required<Pick<XuiConfig, 'componentSize' | 'direction' | 'prefixCls'>> & {
  theme: XuiConfig['theme'];
};

const defaultConfig: XuiConfigContextValue = {
  componentSize: 'middle',
  direction: 'ltr',
  prefixCls: 'xui',
  theme: defaultThemePresets[0]
};

const xuiConfigKey: InjectionKey<XuiConfigContextValue> = Symbol('xui-config');

export function useXuiConfig() {
  return inject(xuiConfigKey, defaultConfig);
}

export const XuiConfigProvider = defineComponent({
  name: 'XuiConfigProvider',
  props: {
    componentSize: { type: String as PropType<XuiComponentSize>, default: defaultConfig.componentSize },
    direction: { type: String as PropType<XuiDirection>, default: defaultConfig.direction },
    prefixCls: { type: String, default: defaultConfig.prefixCls },
    theme: { type: Object as PropType<XuiConfig['theme']>, default: () => defaultConfig.theme }
  },
  setup(props, { attrs, slots }) {
    const context = reactive<XuiConfigContextValue>({ ...defaultConfig });

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
