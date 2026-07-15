import {
  createToggle,
  isInteractive,
  setDisabled,
  setLoading,
  toggle
} from '@xui/core';
import { useMemo, useState } from 'react';

export function useToggle(initial = false) {
  const [state, setState] = useState(() => createToggle(initial));

  const checked = state.checked;
  const disabled = state.disabled ?? false;
  const loading = state.loading ?? false;

  const onToggle = () => setState((prev) => toggle(prev));
  const onSetDisabled = (value: boolean) =>
    setState((prev) => setDisabled(prev, value));
  const onSetLoading = (value: boolean) =>
    setState((prev) => setLoading(prev, value));

  return useMemo(
    () => ({
      checked,
      disabled,
      loading,
      interactive: isInteractive({ disabled, loading }),
      toggle: onToggle,
      setDisabled: onSetDisabled,
      setLoading: onSetLoading
    }),
    [checked, disabled, loading]
  );
}
