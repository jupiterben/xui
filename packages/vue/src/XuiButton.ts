import { type PropType, defineComponent, h } from 'vue';

type XuiButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type XuiButtonSize = 'sm' | 'md' | 'lg';

export const XuiButton = defineComponent({
  name: 'XuiButton',
  props: {
    variant: { type: String as PropType<XuiButtonVariant>, default: 'primary' },
    size: { type: String as PropType<XuiButtonSize>, default: 'md' },
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
