import * as React from 'react';

type XuiGridProps = React.HTMLAttributes<HTMLDivElement> & {
  columns?: number | string;
  gap?: React.CSSProperties['gap'];
  minColumnWidth?: React.CSSProperties['width'];
};

export function XuiGrid({
  children,
  columns = 2,
  gap,
  minColumnWidth,
  style,
  ...props
}: XuiGridProps) {
  const gridTemplateColumns = minColumnWidth
    ? `repeat(auto-fit, minmax(${String(minColumnWidth)}, 1fr))`
    : typeof columns === 'number'
      ? `repeat(${columns}, minmax(0, 1fr))`
      : columns;

  return (
    <div
      {...props}
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap,
        ...style
      }}
    >
      {children}
    </div>
  );
}
