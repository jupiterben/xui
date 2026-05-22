import { type CSSProperties, type PropType, defineComponent, h } from 'vue';

type XuiSpaceSize = 'small' | 'middle' | 'large' | number | string;

function resolveSpaceSize(size: XuiSpaceSize) {
  if (typeof size === 'number') {
    return `${size}px`;
  }

  if (size === 'small') {
    return 'var(--xui-space-2)';
  }

  if (size === 'large') {
    return 'var(--xui-space-5)';
  }

  if (size === 'middle') {
    return 'var(--xui-space-3)';
  }

  return size;
}

export const XuiSpace = defineComponent({
  name: 'XuiSpace',
  props: {
    align: { type: String, default: undefined },
    direction: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    size: { type: [String, Number, Array] as PropType<XuiSpaceSize | [XuiSpaceSize, XuiSpaceSize]>, default: 'small' },
    split: { type: String, default: undefined },
    wrap: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    return () => {
      const items = slots.default?.().filter((child) => child !== null) ?? [];
      const [rowGap, columnGap] = Array.isArray(props.size)
        ? [resolveSpaceSize(props.size[1]), resolveSpaceSize(props.size[0])]
        : [resolveSpaceSize(props.size), resolveSpaceSize(props.size)];

      return h(
        'div',
        {
          ...attrs,
          class: ['xui-space', attrs.class],
          'data-direction': props.direction,
          'data-wrap': props.wrap || undefined,
          style: {
            alignItems: props.align,
            columnGap,
            flexDirection: props.direction === 'vertical' ? 'column' : 'row',
            flexWrap: props.wrap ? 'wrap' : undefined,
            rowGap,
            ...(attrs.style as CSSProperties | undefined)
          }
        },
        items.flatMap((child, index) => [
          h('span', { class: 'xui-space__item', key: `item-${index}` }, [child]),
          props.split && index < items.length - 1 ? h('span', { class: 'xui-space__split', key: `split-${index}` }, props.split) : null
        ])
      );
    };
  }
});
