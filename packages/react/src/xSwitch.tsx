import * as React from 'react';
import { useToggle } from './useToggle';

type xSwitchProps = {
  defaultChecked?: boolean;
  children?: (state: { checked: boolean }) => React.ReactNode;
};

export function xSwitch({ defaultChecked = false, children }: xSwitchProps) {
  const model = useToggle(defaultChecked);

  return (
    <button
      role="switch"
      aria-checked={model.checked}
      disabled={model.disabled}
      onClick={model.toggle}
    >
      {children?.({ checked: model.checked }) ?? (model.checked ? 'On' : 'Off')}
    </button>
  );
}
