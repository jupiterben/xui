export type ToggleState = {
  checked: boolean;
  disabled?: boolean;
};

export function createToggle(initial = false): ToggleState {
  return { checked: initial, disabled: false };
}

export function setDisabled(state: ToggleState, disabled: boolean): ToggleState {
  state.disabled = disabled;
  return state;
}

export function toggle(state: ToggleState): ToggleState {
  if (state.disabled) return state;
  state.checked = !state.checked;
  return state;
}
