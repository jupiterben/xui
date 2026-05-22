import * as React from 'react';

type XuiTagColor = 'default' | 'success' | 'processing' | 'error' | 'warning';

type XuiTagProps = React.HTMLAttributes<HTMLSpanElement> & {
  closable?: boolean;
  color?: XuiTagColor | string;
  onClose?: () => void;
};

const presetColors = new Set<XuiTagColor>(['default', 'success', 'processing', 'error', 'warning']);

export function XuiTag({ children, className, closable = false, color = 'default', onClose, style, ...props }: XuiTagProps) {
  const [closed, setClosed] = React.useState(false);
  const presetColor = presetColors.has(color as XuiTagColor) ? color : undefined;
  const customStyle = presetColor ? undefined : { '--xui-tag-color': color } as React.CSSProperties;

  if (closed) {
    return null;
  }

  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setClosed(true);
    onClose?.();
  };

  return (
    <span
      {...props}
      className={['xui-tag', className].filter(Boolean).join(' ')}
      data-color={presetColor ?? 'custom'}
      style={{
        ...customStyle,
        ...style
      }}
    >
      <span className="xui-tag__content">{children}</span>
      {closable ? (
        <button className="xui-tag__close" type="button" aria-label="Close tag" onClick={handleClose}>
          ×
        </button>
      ) : null}
    </span>
  );
}
