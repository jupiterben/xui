import * as React from 'react';

type XuiButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type XuiButtonSize = 'sm' | 'md' | 'lg';

type XuiButtonProps = {
  variant?: XuiButtonVariant;
  size?: XuiButtonSize;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
};

export function XuiButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}: XuiButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="xui-button"
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  );
}