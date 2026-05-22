import * as React from 'react';

type XuiTypographyType = 'secondary' | 'success' | 'warning' | 'danger';
type XuiTitleLevel = 1 | 2 | 3 | 4 | 5;

type XuiTypographyBaseProps<TElement extends HTMLElement> = React.HTMLAttributes<TElement> & {
  code?: boolean;
  delete?: boolean;
  disabled?: boolean;
  keyboard?: boolean;
  mark?: boolean;
  strong?: boolean;
  type?: XuiTypographyType;
  underline?: boolean;
};

export type XuiTextProps = XuiTypographyBaseProps<HTMLSpanElement>;

export type XuiParagraphProps = XuiTypographyBaseProps<HTMLParagraphElement> & {
  ellipsis?: boolean;
};

export type XuiTitleProps = Omit<XuiTypographyBaseProps<HTMLHeadingElement>, 'type'> & {
  level?: XuiTitleLevel;
  type?: XuiTypographyType;
};

function getTypographyClassName(
  baseClassName: string,
  props: Pick<XuiTypographyBaseProps<HTMLElement>, 'code' | 'delete' | 'disabled' | 'keyboard' | 'mark' | 'strong' | 'type' | 'underline'>,
  className?: string
) {
  return [
    baseClassName,
    props.type ? `${baseClassName}--${props.type}` : undefined,
    props.disabled ? `${baseClassName}--disabled` : undefined,
    props.strong ? `${baseClassName}--strong` : undefined,
    props.underline ? `${baseClassName}--underline` : undefined,
    props.delete ? `${baseClassName}--delete` : undefined,
    props.code ? `${baseClassName}--code` : undefined,
    props.keyboard ? `${baseClassName}--keyboard` : undefined,
    props.mark ? `${baseClassName}--mark` : undefined,
    className
  ]
    .filter(Boolean)
    .join(' ');
}

export function XuiTypographyText({
  className,
  code = false,
  delete: deleted = false,
  disabled = false,
  keyboard = false,
  mark = false,
  strong = false,
  type,
  underline = false,
  ...props
}: XuiTextProps) {
  return (
    <span
      {...props}
      aria-disabled={disabled || undefined}
      className={getTypographyClassName('xui-typography', { code, delete: deleted, disabled, keyboard, mark, strong, type, underline }, className)}
    />
  );
}

export function XuiTypographyParagraph({
  className,
  code = false,
  delete: deleted = false,
  disabled = false,
  ellipsis = false,
  keyboard = false,
  mark = false,
  strong = false,
  type,
  underline = false,
  ...props
}: XuiParagraphProps) {
  return (
    <p
      {...props}
      aria-disabled={disabled || undefined}
      className={[
        getTypographyClassName('xui-typography', { code, delete: deleted, disabled, keyboard, mark, strong, type, underline }, className),
        'xui-typography-paragraph',
        ellipsis ? 'xui-typography-paragraph--ellipsis' : undefined
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

export function XuiTypographyTitle({
  className,
  code = false,
  delete: deleted = false,
  disabled = false,
  keyboard = false,
  level = 1,
  mark = false,
  strong = false,
  type,
  underline = false,
  ...props
}: XuiTitleProps) {
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

  return (
    <Component
      {...props}
      aria-disabled={disabled || undefined}
      className={[
        getTypographyClassName('xui-typography', { code, delete: deleted, disabled, keyboard, mark, strong, type, underline }, className),
        'xui-typography-title'
      ]
        .filter(Boolean)
        .join(' ')}
      data-level={level}
    />
  );
}

export const XuiTypography = {
  Text: XuiTypographyText,
  Paragraph: XuiTypographyParagraph,
  Title: XuiTypographyTitle
};
