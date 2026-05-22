import { type PropType, defineComponent, h } from 'vue';

type XuiTypographyType = 'secondary' | 'success' | 'warning' | 'danger';
type XuiTitleLevel = 1 | 2 | 3 | 4 | 5;

const typographyProps = {
  code: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  keyboard: { type: Boolean, default: false },
  mark: { type: Boolean, default: false },
  strong: { type: Boolean, default: false },
  type: { type: String as PropType<XuiTypographyType>, default: undefined },
  underline: { type: Boolean, default: false }
};

function getTypographyClassName(props: {
  code?: boolean;
  delete?: boolean;
  disabled?: boolean;
  keyboard?: boolean;
  mark?: boolean;
  strong?: boolean;
  type?: XuiTypographyType;
  underline?: boolean;
}) {
  return [
    'xui-typography',
    props.type ? `xui-typography--${props.type}` : undefined,
    props.disabled ? 'xui-typography--disabled' : undefined,
    props.strong ? 'xui-typography--strong' : undefined,
    props.underline ? 'xui-typography--underline' : undefined,
    props.delete ? 'xui-typography--delete' : undefined,
    props.code ? 'xui-typography--code' : undefined,
    props.keyboard ? 'xui-typography--keyboard' : undefined,
    props.mark ? 'xui-typography--mark' : undefined
  ].filter(Boolean);
}

export const XuiTypographyText = defineComponent({
  name: 'XuiTypographyText',
  props: typographyProps,
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'span',
        {
          ...attrs,
          'aria-disabled': props.disabled || undefined,
          class: [...getTypographyClassName(props), attrs.class]
        },
        slots.default?.()
      );
  }
});

export const XuiTypographyParagraph = defineComponent({
  name: 'XuiTypographyParagraph',
  props: {
    ...typographyProps,
    ellipsis: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'p',
        {
          ...attrs,
          'aria-disabled': props.disabled || undefined,
          class: [...getTypographyClassName(props), 'xui-typography-paragraph', props.ellipsis ? 'xui-typography-paragraph--ellipsis' : undefined, attrs.class]
        },
        slots.default?.()
      );
  }
});

export const XuiTypographyTitle = defineComponent({
  name: 'XuiTypographyTitle',
  props: {
    ...typographyProps,
    level: { type: Number as PropType<XuiTitleLevel>, default: 1 }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        `h${props.level}`,
        {
          ...attrs,
          'aria-disabled': props.disabled || undefined,
          class: [...getTypographyClassName(props), 'xui-typography-title', attrs.class],
          'data-level': props.level
        },
        slots.default?.()
      );
  }
});

export const XuiTypography = {
  Text: XuiTypographyText,
  Paragraph: XuiTypographyParagraph,
  Title: XuiTypographyTitle
};
