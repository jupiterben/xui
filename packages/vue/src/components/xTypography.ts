import { type PropType, defineComponent, h } from 'vue';

type xTypographyType = 'secondary' | 'success' | 'warning' | 'danger';
type xTitleLevel = 1 | 2 | 3 | 4 | 5;

const typographyProps = {
  code: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  keyboard: { type: Boolean, default: false },
  mark: { type: Boolean, default: false },
  strong: { type: Boolean, default: false },
  type: { type: String as PropType<xTypographyType>, default: undefined },
  underline: { type: Boolean, default: false }
};

function getTypographyClassName(props: {
  code?: boolean;
  delete?: boolean;
  disabled?: boolean;
  keyboard?: boolean;
  mark?: boolean;
  strong?: boolean;
  type?: xTypographyType;
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

export const xTypographyText = defineComponent({
  name: 'xTypographyText',
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

export const xTypographyParagraph = defineComponent({
  name: 'xTypographyParagraph',
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

export const xTypographyTitle = defineComponent({
  name: 'xTypographyTitle',
  props: {
    ...typographyProps,
    level: { type: Number as PropType<xTitleLevel>, default: 1 }
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

export const xTypography = {
  Text: xTypographyText,
  Paragraph: xTypographyParagraph,
  Title: xTypographyTitle
};
