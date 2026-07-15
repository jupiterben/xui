import { computed, ref } from 'vue';
import {
  createToggle,
  isInteractive,
  setDisabled,
  setLoading,
  toggle
} from '@xui/core';

export function useToggle(initial = false) {
  const state = ref(createToggle(initial));

  const checked = computed(() => state.value.checked);
  const disabled = computed(() => state.value.disabled ?? false);
  const loading = computed(() => state.value.loading ?? false);
  const interactive = computed(() => isInteractive(state.value));

  const onToggle = () => {
    state.value = toggle(state.value);
  };

  const onSetDisabled = (value: boolean) => {
    state.value = setDisabled(state.value, value);
  };

  const onSetLoading = (value: boolean) => {
    state.value = setLoading(state.value, value);
  };

  return {
    checked,
    disabled,
    loading,
    interactive,
    toggle: onToggle,
    setDisabled: onSetDisabled,
    setLoading: onSetLoading
  };
}
