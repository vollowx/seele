import { LitElement, html, isServer } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import { focusVisible, setFocusVisible } from '../core/focus.js';
import { internals, InternalsAttached } from './mixins/internals-attached.js';
import { ListController } from './controllers/list-controller.js';

import type { MenuItem } from './menu-item.js';

export interface MenuEventDetail {
  item: MenuItem;
  index: number;
}
export type MenuActionEvent = CustomEvent<MenuEventDetail>;
export type MenuItemFocusEvent = CustomEvent<MenuEventDetail>;

/**
 * @csspart items
 * @slot - menu items
 * @fires {MenuActionEvent} action - Fires when an item is activated.
 * @fires {MenuItemFocusEvent} item-focus - Fires when an item is focused.
 * @fires {Event} request-popup-hide - Fires when menu should be hidden.
 */
export class Menu extends InternalsAttached(LitElement) {
  /**
   * When true, emits `request-popup-hide` on `action`
   */
  @property({ type: Boolean, attribute: 'keep-open-action' })
  keepOpenAction = false;

  /**
   * When true, removes the default focus management and `aria-activedescendant`
   * on the host.
   */
  @property({ type: Boolean, reflect: true })
  bare = false;

  @queryAssignedElements({ flatten: true }) slotItems!: Array<MenuItem>;
  get $items() {
    return this.listController.items || [];
  }

  get currentIndex() {
    return this.listController?.currentIndex;
  }
  focusFirstItem() {
    this.listController.focusFirstItem();
  }
  focusLastItem() {
    this.listController.focusLastItem();
  }
  focusItem(item: MenuItem) {
    this.listController._focusItem(item);
  }

  override render() {
    return html`<slot part="items"></slot>`;
  }

  constructor() {
    super();
    this[internals].role = 'menu';
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    if (!isServer) {
      this.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.addEventListener('focusin', this.#handleFocusIn.bind(this));
      this.addEventListener('focusout', this.#handleFocusOut.bind(this));
      this.addEventListener('mouseover', this.#handleMouseOver.bind(this));
      this.addEventListener('click', this.#handleClick.bind(this));
      this.addEventListener('pointerdown', this.#handlePointerDown.bind(this));
      this.addEventListener('pointerup', this.#handlePointerUp.bind(this));
    }
  }

  private readonly listController = new ListController<MenuItem>(this, {
    isItem: (item: HTMLElement): item is MenuItem =>
      item.getAttribute('seele-base') === 'option' &&
      !item.hasAttribute('disabled') &&
      !item.hidden,
    getPossibleItems: () => this.slotItems,
    blurItem: (item: MenuItem) => {
      item.focused = false;
    },
    focusItem: (item: MenuItem) => {
      item.focused = true;
      if (!this.bare) this[internals].ariaActiveDescendantElement = item;
      if (focusVisible) item.scrollIntoView({ block: 'nearest' });
      this.dispatchEvent(
        new CustomEvent('item-focus', {
          detail: { item, index: this.$items.indexOf(item) },
          bubbles: true,
          composed: true,
        })
      );
    },
    wrapNavigation: () => false,
  });

  #handleFocusIn() {
    if (this.bare) return;
    // TODO: support focusing first selected
    this.listController.focusFirstItem();
  }

  #handleFocusOut() {
    this.listController._blurItem(this.listController._focusedItem);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;

    const action = getActionFromKey(event);
    const items = this.$items;
    const currentIndex = this.listController.currentIndex;
    const maxIndex = items.length - 1;

    switch (action) {
      case MenuAction.First:
        event.preventDefault();
        this.listController.focusFirstItem();
        return;
      case MenuAction.Last:
        event.preventDefault();
        this.listController.focusLastItem();
        return;
      case MenuAction.PageUp:
      case MenuAction.PageDown: {
        event.preventDefault();
        const { first, last, pageSize } = getVisibleItems(this, items);
        const isDown = action === MenuAction.PageDown;

        const boundary = isDown ? last : first;
        const atBoundary = isDown
          ? currentIndex >= last
          : currentIndex <= first;
        const step = isDown ? pageSize : -pageSize;

        const nextIndex = atBoundary ? currentIndex + step : boundary;

        this.listController._focusItem(
          items[Math.max(0, Math.min(maxIndex, nextIndex))]
        );
        return;
      }
      case MenuAction.Next:
        event.preventDefault();
        this.listController.focusNextItem();
        return;
      case MenuAction.Previous:
        event.preventDefault();
        this.listController.focusPreviousItem();
        return;
      case MenuAction.CloseSelect:
        event.preventDefault();
        if (currentIndex >= 0) {
          items[currentIndex].focused = false;
          this.#dispatchAction({
            item: items[currentIndex],
            index: currentIndex,
          });
          if (this.keepOpenAction) return;
          this.#dispatchHide();
        }
        return;
      case MenuAction.Type:
        this.listController.handleType(event.key);
        return;
    }
  }

  #handleMouseOver(event: MouseEvent) {
    setFocusVisible(false);
    const item = this.#getItemFromEvent(event);
    if (item && this.currentIndex !== item.index)
      this.listController._focusItem(item.item);
  }

  #handleClick(event: MouseEvent) {
    if (this.#suppressClick) {
      this.#suppressClick = false;
      return;
    }

    const item = this.#getItemFromEvent(event);
    if (!item) return;

    item.item.focused = false;
    this.#dispatchAction({ ...item });
    if (!this.keepOpenAction) this.#dispatchHide();
  }

  #suppressClick = false;
  #handlePointerDown(_event: PointerEvent) {
    this.#suppressClick = false;
  }

  #handlePointerUp(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    if (event.button !== 0) return;

    const item = this.#getItemFromEvent(event);
    if (!item) return;

    // Ignore the `click` that follows a mouse release on an item.
    this.#suppressClick = true;
    item.item.focused = false;
    this.#dispatchAction({ ...item });
    if (!this.keepOpenAction) this.#dispatchHide();
  }

  #getItemFromEvent(event: Event) {
    const item = (event.target as HTMLElement).closest<MenuItem>(
      '[seele-base=option]'
    );
    if (!item || !this.$items.includes(item)) return null;
    return { item, index: this.$items.indexOf(item) };
  }

  #dispatchAction(detail: MenuEventDetail) {
    this.dispatchEvent(
      new CustomEvent('action', {
        detail: detail,
        bubbles: true,
        composed: true,
      })
    );
  }
  #dispatchHide() {
    this.dispatchEvent(
      new Event('request-popup-hide', { bubbles: true, composed: true })
    );
  }
}

// Might as well be used in listbox, so let's keep it for now
// Reference: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
export enum MenuAction {
  Close = -11,
  CloseSelect = -10,
  First = 1,
  Last,
  Next,
  Open,
  PageDown,
  PageUp,
  Previous,
  Select,
  Type,
}

export function getActionFromKey(event: KeyboardEvent): MenuAction | null {
  const { key, altKey, ctrlKey, metaKey } = event;

  if (key === 'Escape') return MenuAction.Close;
  if (key === 'Enter' || key === ' ') return MenuAction.CloseSelect;

  if (key === 'Home') return MenuAction.First;
  if (key === 'End') return MenuAction.Last;
  if (key === 'PageUp') return MenuAction.PageUp;
  if (key === 'PageDown') return MenuAction.PageDown;

  if (key === 'ArrowUp' && altKey) return MenuAction.CloseSelect;
  if (key === 'ArrowDown' && !altKey) return MenuAction.Next;
  if (key === 'ArrowUp' && !altKey) return MenuAction.Previous;

  if (
    key === 'Backspace' ||
    key === 'Clear' ||
    (key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey)
  ) {
    return MenuAction.Type;
  }

  return null;
}

export function getVisibleItems(container: HTMLElement, items: HTMLElement[]) {
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
