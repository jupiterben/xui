import { canActivate } from '@xui/core';
import * as React from 'react';

type xButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type xButtonSize = 'sm' | 'md' | 'lg';

type xButtonProps = {
  variant?: xButtonVariant;
  size?: xButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
};

export function xButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children
}: xButtonProps) {
  const interactive = canActivate({ disabled, loading });

  return (
    <button
      disabled={!interactive}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      onClick={(event) => {
        if (!interactive) return;
        onClick?.(event);
      }}
      className="xui-button"
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  );
}
