import * as React from 'react';
import { defaultThemePresets, resolveThemeVariables, type XuiComponentSize, type XuiConfig, type XuiDirection } from '@xui/core';

type XuiConfigContextValue = Required<Pick<XuiConfig, 'componentSize' | 'direction' | 'prefixCls'>> & {
  theme: XuiConfig['theme'];
};

type XuiConfigProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  componentSize?: XuiComponentSize;
  direction?: XuiDirection;
  prefixCls?: string;
  theme?: XuiConfig['theme'];
};

const defaultConfig: XuiConfigContextValue = {
  componentSize: 'middle',
  direction: 'ltr',
  prefixCls: 'xui',
  theme: defaultThemePresets[0]
};

const XuiConfigContext = React.createContext<XuiConfigContextValue>(defaultConfig);

export function useXuiConfig() {
  return React.useContext(XuiConfigContext);
}

export function XuiConfigProvider({
  children,
  className,
  componentSize = defaultConfig.componentSize,
  direction = defaultConfig.direction,
  prefixCls = defaultConfig.prefixCls,
  style,
  theme = defaultConfig.theme,
  ...props
}: XuiConfigProviderProps) {
  const variables = React.useMemo(() => resolveThemeVariables(theme ?? defaultThemePresets[0]) as React.CSSProperties, [theme]);
  const value = React.useMemo<XuiConfigContextValue>(
    () => ({ componentSize, direction, prefixCls, theme }),
    [componentSize, direction, prefixCls, theme]
  );

  return (
    <XuiConfigContext.Provider value={value}>
      <div
        {...props}
        className={['xui-config-provider', className].filter(Boolean).join(' ')}
        data-component-size={componentSize}
        dir={direction}
        style={{
          ...variables,
          ...style
        }}
      >
        {children}
      </div>
    </XuiConfigContext.Provider>
  );
}
