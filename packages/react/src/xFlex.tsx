import * as React from 'react';

type xFlexProps = React.HTMLAttributes<HTMLDivElement> & {
  direction?: React.CSSProperties['flexDirection'];
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  gap?: React.CSSProperties['gap'];
  wrap?: boolean;
};

export function xFlex({
  align,
  children,
  direction = 'row',
  gap,
  justify,
  style,
  wrap = false,
  ...props
}: xFlexProps) {
  return (
    <div
      {...props}
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap,
        flexWrap: wrap ? 'wrap' : undefined,
        ...style
      }}
    >
      {children}
    </div>
  );
}
