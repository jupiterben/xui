import * as React from 'react';
import { useToggle } from '../hooks/useToggle';

type xSwitchProps = {
  defaultChecked?: boolean;
  children?: (state: {
    checked: boolean;
    loading: boolean;
  }) => React.ReactNode;
};

export function xSwitch({ defaultChecked = false, children }: xSwitchProps) {
  const model = useToggle(defaultChecked);

  return (
    <button
      role="switch"
      aria-checked={model.checked}
      aria-busy={model.loading || undefined}
      disabled={!model.interactive}
      onClick={model.toggle}
    >
      {children?.({ checked: model.checked, loading: model.loading }) ??
        (model.loading ? '…' : model.checked ? 'On' : 'Off')}
    </button>
  );
}
