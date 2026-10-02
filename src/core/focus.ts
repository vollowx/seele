import { isServer } from 'lit';

export let focusVisible = false;

export const setFocusVisible = (value: boolean) => {
  focusVisible = value;
};

if (!isServer) {
  window.addEventListener('keydown', () => (focusVisible = true), {
    capture: true,
  });
  window.addEventListener('mousedown', () => (focusVisible = false), {
    capture: true,
  });
}

const isTabbable = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement &&
  element.tabIndex >= 0 &&
  !element.hasAttribute('disabled') &&
  !element.hidden &&
  element.getAttribute('tabindex') !== '-1';

/**
 * If callback returns true, stop walking.
 */
const walkTabbable = (
  root: Element | DocumentFragment,
  callback: (element: HTMLElement) => boolean
): boolean => {
  if (root.nodeName === 'SLOT') {
    const assigned = (root as HTMLSlotElement).assignedElements({
      flatten: true,
    });

    for (const element of assigned) {
      if (walkTabbable(element, callback)) return true;
    }

    return false;
  }

  if (root instanceof HTMLElement && isTabbable(root)) {
    if (callback(root)) return true;
  }

  if ('shadowRoot' in root && root.shadowRoot) {
    if (walkTabbable(root.shadowRoot, callback)) return true;
  }

  for (const child of root.children) {
    if (walkTabbable(child, callback)) return true;
  }

  return false;
};

export const getFirstTabbable = (root: Element | DocumentFragment) => {
  let first: HTMLElement | null = null;

  walkTabbable(root, (element) => {
    first = element;
    return true;
  });

  return first;
};

export const getAllTabbables = (root: Element | DocumentFragment) => {
  let tabbables: HTMLElement[] = [];

  walkTabbable(root, (element) => {
    tabbables.push(element);
    return false;
  });

  return tabbables;
};
