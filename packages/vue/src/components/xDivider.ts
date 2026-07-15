import { type PropType, defineComponent, h } from 'vue';

export const xDivider = defineComponent({
  name: 'xDivider',
  props: {
    dashed: { type: Boolean, default: false },
    orientation: { type: String as PropType<'left' | 'center' | 'right'>, default: 'center' },
    plain: { type: Boolean, default: false },
    type: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'div',
        {
          ...attrs,
          'aria-orientation': props.type,
          class: ['xui-divider', attrs.class],
          'data-dashed': props.dashed || undefined,
          'data-orientation': props.orientation,
          'data-plain': props.plain || undefined,
          'data-type': props.type,
          role: 'separator'
        },
        slots.default?.() ? h('span', { class: 'xui-divider__text' }, slots.default?.()) : undefined
      );
  }
});
