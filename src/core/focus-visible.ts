import { isServer } from 'lit';

export let focusVisible = false;

export function setFocusVisible(value: boolean) {
  focusVisible = value;
}

if (!isServer) {
  window.addEventListener('keydown', () => (focusVisible = true), {
    capture: true,
  });
  window.addEventListener('mousedown', () => (focusVisible = false), {
    capture: true,
  });
}
