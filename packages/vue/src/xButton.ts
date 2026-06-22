import { type PropType, defineComponent, h } from 'vue';

type xButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type xButtonSize = 'sm' | 'md' | 'lg';

export const xButton = defineComponent({
  name: 'xButton',
  props: {
    variant: { type: String as PropType<xButtonVariant>, default: 'primary' },
    size: { type: String as PropType<xButtonSize>, default: 'md' },
    disabled: { type: Boolean, default: false }
  },
  emits: {
    click: (_event: MouseEvent) => true
  },
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          class: ['xui-button', attrs.class].filter(Boolean).join(' '),
          'data-variant': props.variant,
          'data-size': props.size,
          disabled: props.disabled,
          onClick: (event: MouseEvent) => emit('click', event)
        },
        slots.default?.()
      );
  }
});
