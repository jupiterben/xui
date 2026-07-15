import { type CSSProperties, defineComponent, h } from 'vue';

export const xFlex = defineComponent({
  name: 'xFlex',
  props: {
    direction: { type: String, default: 'row' },
    align: { type: String, default: undefined },
    justify: { type: String, default: undefined },
    gap: { type: [Number, String], default: undefined },
    wrap: { type: Boolean, default: false }
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: props.direction,
            alignItems: props.align,
            justifyContent: props.justify,
            gap: props.gap,
            flexWrap: props.wrap ? 'wrap' : undefined
          } as CSSProperties
        },
        slots.default?.()
      );
  }
});
