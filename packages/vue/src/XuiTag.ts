import { type CSSProperties, defineComponent, h, ref } from 'vue';

type XuiTagColor = 'default' | 'success' | 'processing' | 'error' | 'warning';

const presetColors = new Set<XuiTagColor>(['default', 'success', 'processing', 'error', 'warning']);

export const XuiTag = defineComponent({
  name: 'XuiTag',
  props: {
    closable: { type: Boolean, default: false },
    color: { type: String, default: 'default' }
  },
  emits: {
    close: () => true
  },
  setup(props, { attrs, emit, slots }) {
    const closed = ref(false);

    function handleClose(event: MouseEvent) {
      event.stopPropagation();
      closed.value = true;
      emit('close');
    }

    return () => {
      if (closed.value) {
        return null;
      }

      const presetColor = presetColors.has(props.color as XuiTagColor) ? props.color : undefined;

      return h(
        'span',
        {
          ...attrs,
          class: ['xui-tag', attrs.class],
          'data-color': presetColor ?? 'custom',
          style: {
            ...(presetColor ? undefined : { '--xui-tag-color': props.color }),
            ...(attrs.style as CSSProperties | undefined)
          }
        },
        [
          h('span', { class: 'xui-tag__content' }, slots.default?.()),
          props.closable ? h('button', { class: 'xui-tag__close', type: 'button', 'aria-label': 'Close tag', onClick: handleClose }, '×') : null
        ]
      );
    };
  }
});
