import { MiddlewareData, Placement } from '@floating-ui/dom';

export function transformOriginFromArrow(
  placement: Placement,
  arrowData?: MiddlewareData['arrow']
): string {
  const { x: arrowX, y: arrowY } = arrowData || {};
  const [side] = placement.split('-');

  let originX = '';
  let originY = '';

  if (side === 'top') {
    originX = arrowX != null ? `${arrowX}px` : 'center';
    originY = 'bottom';
  } else if (side === 'bottom') {
    originX = arrowX != null ? `${arrowX}px` : 'center';
    originY = 'top';
  } else if (side === 'left') {
    originX = 'right';
    originY = arrowY != null ? `${arrowY}px` : 'center';
  } else if (side === 'right') {
    originX = 'left';
    originY = arrowY != null ? `${arrowY}px` : 'center';
  }

  return `${originX} ${originY}`;
}
