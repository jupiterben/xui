import { isInteractive } from '@xui/core';
import * as React from 'react';

type xAlertType = 'success' | 'info' | 'warning' | 'error';

type xAlertProps = React.HTMLAttributes<HTMLDivElement> & {
  action?: React.ReactNode;
  closable?: boolean;
  description?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  message: React.ReactNode;
  onClose?: () => void;
  showIcon?: boolean;
  type?: xAlertType;
};

const iconByType: Record<xAlertType, string> = {
  success: '✓',
  info: 'i',
  warning: '!',
  error: '×'
};

export function xAlert({
  action,
  className,
  closable = false,
  description,
  disabled = false,
  loading = false,
  message,
  onClose,
  showIcon = false,
  type = 'info',
  ...props
}: xAlertProps) {
  const [closed, setClosed] = React.useState(false);
  const interactive = isInteractive({ disabled, loading });

  if (closed) {
    return null;
  }

  const handleClose = () => {
    if (!interactive) return;
    setClosed(true);
    onClose?.();
  };

  return (
    <div
      {...props}
      className={['xui-alert', className].filter(Boolean).join(' ')}
      data-type={type}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      role="alert"
    >
      {showIcon ? <span className="xui-alert__icon" aria-hidden="true">{iconByType[type]}</span> : null}
      <div className="xui-alert__content">
        <div className="xui-alert__message">{message}</div>
        {description ? <div className="xui-alert__description">{description}</div> : null}
      </div>
      {action ? <div className="xui-alert__action">{action}</div> : null}
      {closable ? (
        <button
          className="xui-alert__close"
          type="button"
          aria-label="Close alert"
          disabled={!interactive}
          aria-busy={loading || undefined}
          onClick={handleClose}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
