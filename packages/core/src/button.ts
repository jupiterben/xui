import {
  type InteractiveState,
  createInteractive,
  isInteractive
} from './interactive';

export type ButtonState = InteractiveState;

export function createButton(initial?: InteractiveState): ButtonState {
  return createInteractive(initial);
}

export function canActivate(state: ButtonState): boolean {
  return isInteractive(state);
}
