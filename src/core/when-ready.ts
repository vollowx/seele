async function waitForElement(
  element: HTMLElement | null | undefined
): Promise<void> {
  if (!element) return;

  if (element.matches(':not(:defined)')) {
    await customElements.whenDefined(element.localName);
  }

  if ('updateComplete' in element) {
    await (element as { updateComplete?: Promise<unknown> }).updateComplete;
  }
}

export async function whenReady(
  ...elements: Array<HTMLElement | null | undefined>
): Promise<void> {
  if (elements.length === 1) {
    await waitForElement(elements[0]);
    return;
  }

  await Promise.all(elements.map((el) => waitForElement(el)));
}
