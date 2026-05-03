import { useMemo, useState } from 'react';
import { createToggle, setDisabled, toggle } from '@xui/core';

export function useToggle(initial = false) {
  const [state, setState] = useState(() => createToggle(initial));

  const checked = state.checked;
  const disabled = state.disabled ?? false;

  const onToggle = () => setState((prev) => ({ ...toggle({ ...prev }) }));
  const onSetDisabled = (value: boolean) =>
    setState((prev) => ({ ...setDisabled({ ...prev }, value) }));

  return useMemo(
    () => ({
      checked,
      disabled,
      toggle: onToggle,
      setDisabled: onSetDisabled
    }),
    [checked, disabled]
  );
}
