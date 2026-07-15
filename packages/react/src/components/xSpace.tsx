import * as React from 'react';

type xSpaceSize = 'small' | 'middle' | 'large' | number | string;

type xSpaceProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: React.CSSProperties['alignItems'];
  direction?: 'horizontal' | 'vertical';
  size?: xSpaceSize | [xSpaceSize, xSpaceSize];
  split?: React.ReactNode;
  wrap?: boolean;
};

function resolveSpaceSize(size: xSpaceSize) {
  if (typeof size === 'number') {
    return `${size}px`;
  }

  if (size === 'small') {
    return 'var(--xui-space-2)';
  }

  if (size === 'large') {
    return 'var(--xui-space-5)';
  }

  if (size === 'middle') {
    return 'var(--xui-space-3)';
  }

  return size;
}

export function xSpace({
  align,
  children,
  className,
  direction = 'horizontal',
  size = 'small',
  split,
  style,
  wrap = false,
  ...props
}: xSpaceProps) {
  const items = React.Children.toArray(children).filter((child) => child !== null && child !== undefined);
  const [rowGap, columnGap] = Array.isArray(size) ? [resolveSpaceSize(size[1]), resolveSpaceSize(size[0])] : [resolveSpaceSize(size), resolveSpaceSize(size)];

  return (
    <div
      {...props}
      className={['xui-space', className].filter(Boolean).join(' ')}
      data-direction={direction}
      data-wrap={wrap || undefined}
      style={{
        alignItems: align,
        columnGap,
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        flexWrap: wrap ? 'wrap' : undefined,
        rowGap,
        ...style
      }}
    >
      {items.map((child, index) => (
        <React.Fragment key={index}>
          <span className="xui-space__item">{child}</span>
          {split && index < items.length - 1 ? <span className="xui-space__split">{split}</span> : null}
        </React.Fragment>
      ))}
    </div>
  );
}
