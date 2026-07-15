import * as React from 'react';
import { defaultThemePresets, resolveThemeVariables, type xComponentSize, type xConfig, type xDirection } from '@xui/core';

type xConfigContextValue = Required<Pick<xConfig, 'componentSize' | 'direction' | 'prefixCls'>> & {
  theme: xConfig['theme'];
};

type xConfigProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  componentSize?: xComponentSize;
  direction?: xDirection;
  prefixCls?: string;
  theme?: xConfig['theme'];
};

const defaultConfig: xConfigContextValue = {
  componentSize: 'middle',
  direction: 'ltr',
  prefixCls: 'xui',
  theme: defaultThemePresets[0]
};

const xConfigContext = React.createContext<xConfigContextValue>(defaultConfig);

export function useXConfig() {
  return React.useContext(xConfigContext);
}

export function xConfigProvider({
  children,
  className,
  componentSize = defaultConfig.componentSize,
  direction = defaultConfig.direction,
  prefixCls = defaultConfig.prefixCls,
  style,
  theme = defaultConfig.theme,
  ...props
}: xConfigProviderProps) {
  const variables = React.useMemo(() => resolveThemeVariables(theme ?? defaultThemePresets[0]) as React.CSSProperties, [theme]);
  const value = React.useMemo<xConfigContextValue>(
    () => ({ componentSize, direction, prefixCls, theme }),
    [componentSize, direction, prefixCls, theme]
  );

  return (
    <xConfigContext.Provider value={value}>
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
    </xConfigContext.Provider>
  );
}
