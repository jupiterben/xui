import { type CSSProperties, defineComponent, h } from 'vue';

export const XuiGrid = defineComponent({
  name: 'XuiGrid',
  props: {
    columns: { type: [Number, String], default: 2 },
    gap: { type: [Number, String], default: undefined },
    minColumnWidth: { type: [Number, String], default: undefined }
  },
  setup(props, { slots }) {
    return () => {
      const gridTemplateColumns = props.minColumnWidth
        ? `repeat(auto-fit, minmax(${String(props.minColumnWidth)}, 1fr))`
        : typeof props.columns === 'number'
          ? `repeat(${props.columns}, minmax(0, 1fr))`
          : props.columns;

      return h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns,
            gap: props.gap
          } as CSSProperties
        },
        slots.default?.()
      );
    };
  }
});
