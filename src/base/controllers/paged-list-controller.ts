import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ListController } from './list-controller.js';

export interface PagedListControllerHost<T extends HTMLElement>
  extends ReactiveControllerHost, HTMLElement {
  readonly listController: ListController<T>;
}

export class PagedListController<
  Item extends HTMLElement,
> implements ReactiveController {
  host: PagedListControllerHost<Item>;

  constructor(host: PagedListControllerHost<Item>) {
    (this.host = host).addController(this);
  }
  hostConnected() {}

  getVisibleItems(container: HTMLElement, items: HTMLElement[]) {
    if (!items.length) return { first: 0, last: 0, pageSize: 1 };

    const containerRect = container.getBoundingClientRect();
    const style = window.getComputedStyle(container);

    const paddingTop = parseFloat(style.scrollPaddingTop) || 0;
    const paddingBottom = parseFloat(style.scrollPaddingBottom) || 0;
    const top = containerRect.top + container.clientTop + paddingTop;
    const bottom = top + container.clientHeight - paddingTop - paddingBottom;

    let first = -1;
    let last = -1;

    for (let i = 0; i < items.length; i++) {
      const itemRect = items[i].getBoundingClientRect();

      if (itemRect.top < bottom && itemRect.bottom > top) {
        if (first === -1) first = i;
        last = i;
      } else if (first !== -1) {
        break;
      }
    }

    if (first === -1) {
      return { first: 0, last: 0, pageSize: 1 };
    }

    // pageSize is the span of visible items
    return { first, last, pageSize: Math.max(1, last - first + 1) };
  }

  /**
   * @param [items=this.items] Set if this function is part a bigger `handleKeydown()`, to prevent multiple DOM queries
   * @returns Whether the keystroke is handled or not
   */
  handleKeydown(
    event: KeyboardEvent,
    items: Item[] = this.host.listController.items
  ): boolean {
    const key = event.key;
    const controller = this.host.listController;
    const currentIndex = controller.currentIndex;
    let nextItem: any | null = null;

    if (key === 'PageUp' || key === 'PageDown') {
      event.preventDefault();
      const { first, last, pageSize } = this.getVisibleItems(this.host, items);
      const isDown = key === 'PageDown';

      const boundary = isDown ? last : first;
      const atBoundary = isDown ? currentIndex >= last : currentIndex <= first;
      const step = isDown ? pageSize : -pageSize;

      const nextIndex = atBoundary ? currentIndex + step : boundary;

      nextItem = controller.focusItem(
        items[Math.max(0, Math.min(items.length - 1, nextIndex))]
      );
    }

    return nextItem !== null;
  }
}
