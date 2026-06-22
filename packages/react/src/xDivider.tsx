import * as React from 'react';

type xDividerProps = React.HTMLAttributes<HTMLDivElement> & {
  dashed?: boolean;
  orientation?: 'left' | 'center' | 'right';
  plain?: boolean;
  type?: 'horizontal' | 'vertical';
};

export function xDivider({
  children,
  className,
  dashed = false,
  orientation = 'center',
  plain = false,
  type = 'horizontal',
  ...props
}: xDividerProps) {
  return (
    <div
      {...props}
      aria-orientation={type}
      className={['xui-divider', className].filter(Boolean).join(' ')}
      data-dashed={dashed || undefined}
      data-orientation={orientation}
      data-plain={plain || undefined}
      data-type={type}
      role="separator"
    >
      {children ? <span className="xui-divider__text">{children}</span> : null}
    </div>
  );
}
