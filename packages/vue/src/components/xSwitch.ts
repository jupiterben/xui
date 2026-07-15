import { defineComponent, h } from 'vue';
import { useToggle } from '../composables/useToggle';

export const xSwitch = defineComponent({
  name: 'xSwitch',
  props: {
    defaultChecked: { type: Boolean, default: false }
  },
  setup(props, { slots }) {
    const model = useToggle(props.defaultChecked);

    return () =>
      h(
        'button',
        {
          role: 'switch',
          'aria-checked': model.checked.value,
          'aria-busy': model.loading.value || undefined,
          disabled: !model.interactive.value,
          onClick: model.toggle
        },
        slots.default?.({
          checked: model.checked.value,
          loading: model.loading.value
        }) ??
          (model.loading.value
            ? '…'
            : model.checked.value
              ? 'On'
              : 'Off')
      );
  }
});
