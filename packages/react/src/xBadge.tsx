import * as React from 'react';

type xBadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

type xBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  color?: string;
  count?: React.ReactNode;
  dot?: boolean;
  overflowCount?: number;
  showZero?: boolean;
  status?: xBadgeStatus;
  text?: React.ReactNode;
};

function getDisplayCount(count: React.ReactNode, overflowCount: number) {
  if (typeof count === 'number' && count > overflowCount) {
    return `${overflowCount}+`;
  }

  return count;
}

export function xBadge({
  children,
  className,
  color,
  count,
  dot = false,
  overflowCount = 99,
  showZero = false,
  status,
  style,
  text,
  ...props
}: xBadgeProps) {
  const isZero = count === 0;
  const shouldShowCount = dot || (!status && count !== undefined && (!isZero || showZero));
  const customStyle = color ? ({ '--xui-badge-color': color } as React.CSSProperties) : undefined;

  if (status) {
    return (
      <span {...props} className={['xui-badge xui-badge-status', className].filter(Boolean).join(' ')} data-status={status} style={{ ...customStyle, ...style }}>
        <span className="xui-badge-status__dot" />
        {text ? <span className="xui-badge-status__text">{text}</span> : null}
      </span>
    );
  }

  return (
    <span {...props} className={['xui-badge', className].filter(Boolean).join(' ')} style={{ ...customStyle, ...style }}>
      {children ? <span className="xui-badge__child">{children}</span> : null}
      {shouldShowCount ? (
        <sup className="xui-badge__count" data-dot={dot || undefined}>
          {dot ? null : getDisplayCount(count, overflowCount)}
        </sup>
      ) : null}
      {!children && text ? <span className="xui-badge-status__text">{text}</span> : null}
    </span>
  );
}
