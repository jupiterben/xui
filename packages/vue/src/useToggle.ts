import { computed, ref } from 'vue';
import { createToggle, setDisabled, toggle } from '@xui/core';

export function useToggle(initial = false) {
  const state = ref(createToggle(initial));

  const checked = computed(() => state.value.checked);
  const disabled = computed(() => state.value.disabled ?? false);

  const onToggle = () => {
    state.value = toggle(state.value);
  };

  const onSetDisabled = (value: boolean) => {
    state.value = setDisabled(state.value, value);
  };

  return {
    checked,
    disabled,
    toggle: onToggle,
    setDisabled: onSetDisabled
  };
}
