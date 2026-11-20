import { isServer } from 'lit';

/**
 * This approach works fine for all the time, but I also consider making use of
 * `:focus-visible` CSS in the future.
 */
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

export const isFocusable = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement &&
  !element.hasAttribute('disabled') &&
  !element.hidden &&
  (element.hasAttribute('tabindex') ||
    element.tabIndex >= 0 ||
    element.shadowRoot?.delegatesFocus === true);

export const isTabbable = (element: Element): element is HTMLElement =>
  isFocusable(element) && element.tabIndex >= 0;

/**
 * Recursively walks the tree (walking through shadow DOM and resolving slots),
 * and invokes the callback on every element matching `cond`.
 *
 * @param cond - Whether an element can be counted "found" or not.
 * @param callback - Called when an element is found. If callback returns true, stop walking.
 * @returns Found or not
 */
function walk(
  root: Element | DocumentFragment,
  cond: (element: HTMLElement) => boolean,
  callback: (element: HTMLElement) => boolean
): boolean {
  if (root.nodeName === 'SLOT') {
    const assigned = (root as HTMLSlotElement).assignedElements({
      flatten: true,
    });

    for (const element of assigned) {
      if (walk(element, cond, callback)) return true;
    }

    return false;
  }

  if (root instanceof HTMLElement && cond(root)) {
    if (callback(root)) return true;
  }

  if ('shadowRoot' in root && root.shadowRoot) {
    if (walk(root.shadowRoot, cond, callback)) return true;
  }

  for (const child of root.children) {
    if (walk(child, cond, callback)) return true;
  }

  return false;
}

export function getFirstTabbable(
  root: Element | DocumentFragment
): HTMLElement | null {
  let first: HTMLElement | null = null;

  walk(root, isTabbable, (element) => {
    first = element;
    return true;
  });

  return first;
}

export function getAllTabbables(
  root: Element | DocumentFragment
): HTMLElement[] {
  let tabbables: HTMLElement[] = [];

  walk(root, isTabbable, (element) => {
    tabbables.push(element);
    return false;
  });

  return tabbables;
}

export function getFirstFocusable(
  root: Element | DocumentFragment
): HTMLElement | null {
  let first: HTMLElement | null = null;

  walk(root, isFocusable, (element) => {
    first = element;
    return true;
  });

  return first;
}

export function getAllFocusables(
  root: Element | DocumentFragment
): HTMLElement[] {
  let focusables: HTMLElement[] = [];

  walk(root, isFocusable, (element) => {
    focusables.push(element);
    return false;
  });

  return focusables;
}
