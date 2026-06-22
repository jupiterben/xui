import { defineComponent, h } from 'vue';
import { useToggle } from './useToggle';

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
          disabled: model.disabled.value,
          onClick: model.toggle
        },
        slots.default?.({ checked: model.checked.value }) ??
          (model.checked.value ? 'On' : 'Off')
      );
  }
});
