import * as React from 'react';

type xAlertType = 'success' | 'info' | 'warning' | 'error';

type xAlertProps = React.HTMLAttributes<HTMLDivElement> & {
  action?: React.ReactNode;
  closable?: boolean;
  description?: React.ReactNode;
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
  message,
  onClose,
  showIcon = false,
  type = 'info',
  ...props
}: xAlertProps) {
  const [closed, setClosed] = React.useState(false);

  if (closed) {
    return null;
  }

  const handleClose = () => {
    setClosed(true);
    onClose?.();
  };

  return (
    <div {...props} className={['xui-alert', className].filter(Boolean).join(' ')} data-type={type} role="alert">
      {showIcon ? <span className="xui-alert__icon" aria-hidden="true">{iconByType[type]}</span> : null}
      <div className="xui-alert__content">
        <div className="xui-alert__message">{message}</div>
        {description ? <div className="xui-alert__description">{description}</div> : null}
      </div>
      {action ? <div className="xui-alert__action">{action}</div> : null}
      {closable ? (
        <button className="xui-alert__close" type="button" aria-label="Close alert" onClick={handleClose}>
          ×
        </button>
      ) : null}
    </div>
  );
}
