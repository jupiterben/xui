import * as React from 'react';

type xButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type xButtonSize = 'sm' | 'md' | 'lg';

type xButtonProps = {
  variant?: xButtonVariant;
  size?: xButtonSize;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
};

export function xButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}: xButtonProps) {
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