import { isInteractive } from '@xui/core';
import { type CSSProperties, defineComponent, h, ref } from 'vue';

type xTagColor = 'default' | 'success' | 'processing' | 'error' | 'warning';

const presetColors = new Set<xTagColor>(['default', 'success', 'processing', 'error', 'warning']);

export const xTag = defineComponent({
  name: 'xTag',
  props: {
    closable: { type: Boolean, default: false },
    color: { type: String, default: 'default' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  emits: {
    close: () => true
  },
  setup(props, { attrs, emit, slots }) {
    const closed = ref(false);

    function handleClose(event: MouseEvent) {
      event.stopPropagation();
      if (!isInteractive({ disabled: props.disabled, loading: props.loading })) return;
      closed.value = true;
      emit('close');
    }

    return () => {
      if (closed.value) {
        return null;
      }

      const interactive = isInteractive({
        disabled: props.disabled,
        loading: props.loading
      });
      const presetColor = presetColors.has(props.color as xTagColor) ? props.color : undefined;

      return h(
        'span',
        {
          ...attrs,
          class: ['xui-tag', attrs.class],
          'data-color': presetColor ?? 'custom',
          'data-loading': props.loading || undefined,
          'aria-busy': props.loading || undefined,
          style: {
            ...(presetColor ? undefined : { '--xui-tag-color': props.color }),
            ...(attrs.style as CSSProperties | undefined)
          }
        },
        [
          h('span', { class: 'xui-tag__content' }, slots.default?.()),
          props.closable
            ? h(
                'button',
                {
                  class: 'xui-tag__close',
                  type: 'button',
                  'aria-label': 'Close tag',
                  disabled: !interactive,
                  'aria-busy': props.loading || undefined,
                  onClick: handleClose
                },
                '×'
              )
            : null
        ]
      );
    };
  }
});
