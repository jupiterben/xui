import { isInteractive } from '@xui/core';
import * as React from 'react';

type xTagColor = 'default' | 'success' | 'processing' | 'error' | 'warning';

type xTagProps = React.HTMLAttributes<HTMLSpanElement> & {
  closable?: boolean;
  color?: xTagColor | string;
  disabled?: boolean;
  loading?: boolean;
  onClose?: () => void;
};

const presetColors = new Set<xTagColor>(['default', 'success', 'processing', 'error', 'warning']);

export function xTag({
  children,
  className,
  closable = false,
  color = 'default',
  disabled = false,
  loading = false,
  onClose,
  style,
  ...props
}: xTagProps) {
  const [closed, setClosed] = React.useState(false);
  const interactive = isInteractive({ disabled, loading });
  const presetColor = presetColors.has(color as xTagColor) ? color : undefined;
  const customStyle = presetColor ? undefined : ({ '--xui-tag-color': color } as React.CSSProperties);

  if (closed) {
    return null;
  }

  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!interactive) return;
    setClosed(true);
    onClose?.();
  };

  return (
    <span
      {...props}
      className={['xui-tag', className].filter(Boolean).join(' ')}
      data-color={presetColor ?? 'custom'}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      style={{
        ...customStyle,
        ...style
      }}
    >
      <span className="xui-tag__content">{children}</span>
      {closable ? (
        <button
          className="xui-tag__close"
          type="button"
          aria-label="Close tag"
          disabled={!interactive}
          aria-busy={loading || undefined}
          onClick={handleClose}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
