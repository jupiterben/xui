import {
  type InteractiveState,
  createInteractive,
  isInteractive,
  setDisabled,
  setLoading
} from './interactive';

export type ToggleState = InteractiveState & {
  checked: boolean;
};

export function createToggle(initial = false): ToggleState {
  return { ...createInteractive(), checked: initial };
}

export { setDisabled, setLoading, isInteractive };

export function toggle(state: ToggleState): ToggleState {
  if (!isInteractive(state)) return state;
  return { ...state, checked: !state.checked };
}
