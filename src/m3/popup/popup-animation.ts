export function handleAnimationChange(
  popup: HTMLElement,
  fadeByDefault?: () => boolean
) {
  popup.addEventListener('beforetoggle', () => {
    const animation = getComputedStyle(popup)
      .getPropertyValue('--md-popup-animation')
      .trim();
    popup.toggleAttribute(
      'data-popup-fade',
      animation === 'fade' || (!animation && !!fadeByDefault?.())
    );
  });
}
