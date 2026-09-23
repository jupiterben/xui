import { derived, writable } from 'svelte/store';
import {
  createToggle,
  isInteractive,
  setDisabled,
  setLoading,
  toggle
} from '@xui/core';

export function useToggle(initial = false) {
  const state = writable(createToggle(initial));

  return {
    checked: derived(state, ($state) => $state.checked),
    disabled: derived(state, ($state) => $state.disabled ?? false),
    loading: derived(state, ($state) => $state.loading ?? false),
    interactive: derived(state, ($state) => isInteractive($state)),
    toggle: () => state.update(toggle),
    setDisabled: (value: boolean) => state.update((current) => setDisabled(current, value)),
    setLoading: (value: boolean) => state.update((current) => setLoading(current, value))
  };
}
