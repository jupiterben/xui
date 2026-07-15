import * as React from 'react';

type xTypographyType = 'secondary' | 'success' | 'warning' | 'danger';
type xTitleLevel = 1 | 2 | 3 | 4 | 5;

type xTypographyBaseProps<TElement extends HTMLElement> = React.HTMLAttributes<TElement> & {
  code?: boolean;
  delete?: boolean;
  disabled?: boolean;
  keyboard?: boolean;
  mark?: boolean;
  strong?: boolean;
  type?: xTypographyType;
  underline?: boolean;
};

export type xTextProps = xTypographyBaseProps<HTMLSpanElement>;

export type xParagraphProps = xTypographyBaseProps<HTMLParagraphElement> & {
  ellipsis?: boolean;
};

export type xTitleProps = Omit<xTypographyBaseProps<HTMLHeadingElement>, 'type'> & {
  level?: xTitleLevel;
  type?: xTypographyType;
};

function getTypographyClassName(
  baseClassName: string,
  props: Pick<xTypographyBaseProps<HTMLElement>, 'code' | 'delete' | 'disabled' | 'keyboard' | 'mark' | 'strong' | 'type' | 'underline'>,
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

export function xTypographyText({
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
}: xTextProps) {
  return (
    <span
      {...props}
      aria-disabled={disabled || undefined}
      className={getTypographyClassName('xui-typography', { code, delete: deleted, disabled, keyboard, mark, strong, type, underline }, className)}
    />
  );
}

export function xTypographyParagraph({
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
}: xParagraphProps) {
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

export function xTypographyTitle({
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
}: xTitleProps) {
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

export const xTypography = {
  Text: xTypographyText,
  Paragraph: xTypographyParagraph,
  Title: xTypographyTitle
};
