import { type PropType, defineComponent, h, ref } from 'vue';

type xAlertType = 'success' | 'info' | 'warning' | 'error';

const iconByType: Record<xAlertType, string> = {
  success: '✓',
  info: 'i',
  warning: '!',
  error: '×'
};

export const xAlert = defineComponent({
  name: 'xAlert',
  props: {
    action: { type: String, default: undefined },
    closable: { type: Boolean, default: false },
    description: { type: String, default: undefined },
    message: { type: String, required: true },
    showIcon: { type: Boolean, default: false },
    type: { type: String as PropType<xAlertType>, default: 'info' }
  },
  emits: {
    close: () => true
  },
  setup(props, { attrs, emit, slots }) {
    const closed = ref(false);

    function handleClose() {
      closed.value = true;
      emit('close');
    }

    return () => {
      if (closed.value) {
        return null;
      }

      return h(
        'div',
        {
          ...attrs,
          class: ['xui-alert', attrs.class],
          'data-type': props.type,
          role: 'alert'
        },
        [
          props.showIcon ? h('span', { class: 'xui-alert__icon', 'aria-hidden': 'true' }, iconByType[props.type]) : null,
          h('div', { class: 'xui-alert__content' }, [
            h('div', { class: 'xui-alert__message' }, slots.message?.() ?? props.message),
            props.description || slots.description ? h('div', { class: 'xui-alert__description' }, slots.description?.() ?? props.description) : null
          ]),
          props.action || slots.action ? h('div', { class: 'xui-alert__action' }, slots.action?.() ?? props.action) : null,
          props.closable
            ? h('button', { class: 'xui-alert__close', type: 'button', 'aria-label': 'Close alert', onClick: handleClose }, '×')
            : null
        ]
      );
    };
  }
});
