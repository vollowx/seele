export async function ensureReady(
  element: HTMLElement | null,
  useAnimationFrame = false
): Promise<void> {
  if (!element) return;

  if (element.matches(':not(:defined)'))
    await customElements.whenDefined(element.tagName.toLowerCase());

  if ('updateComplete' in element)
    await (element as { updateComplete?: Promise<unknown> }).updateComplete;

  if (useAnimationFrame)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

export async function ensureSlottedReady(
  host: HTMLElement,
  getSlotted?: () => (HTMLElement | null)[],
  useAnimationFrame = false
): Promise<void> {
  await ensureReady(host);

  if (getSlotted) {
    const elements = getSlotted();
    await Promise.all(elements.map((el) => ensureReady(el, false)));
  }

  // Might be useful when you need to use sth like `getBoundingClientRect()`
  if (useAnimationFrame)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}
