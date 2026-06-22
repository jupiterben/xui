import { type CSSProperties, defineComponent, h, ref } from 'vue';

type xTagColor = 'default' | 'success' | 'processing' | 'error' | 'warning';

const presetColors = new Set<xTagColor>(['default', 'success', 'processing', 'error', 'warning']);

export const xTag = defineComponent({
  name: 'xTag',
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

      const presetColor = presetColors.has(props.color as xTagColor) ? props.color : undefined;

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
