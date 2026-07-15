export type InteractiveState = {
  disabled?: boolean;
  loading?: boolean;
};

export function createInteractive(initial?: InteractiveState): InteractiveState {
  return {
    disabled: initial?.disabled ?? false,
    loading: initial?.loading ?? false
  };
}

export function setDisabled<T extends InteractiveState>(state: T, disabled: boolean): T {
  if (state.disabled === disabled) return state;
  return { ...state, disabled };
}

export function setLoading<T extends InteractiveState>(state: T, loading: boolean): T {
  if (state.loading === loading) return state;
  return { ...state, loading };
}

export function isInteractive(state: InteractiveState): boolean {
  return !(state.disabled || state.loading);
}
