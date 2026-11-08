import { LitElement, html, isServer } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import type { ListItem } from './list-item.js';
import { focusVisible, setFocusVisible } from '../core/focus.js';
import { internals, InternalsAttached } from './mixins/internals-attached.js';
import { ListController } from './controllers/list-controller.js';
import { MenuAction, getActionFromKey, getVisibleItems } from './menu.js';

export interface ListboxSelectDetail {
  item: ListItem;
  index: number;
}

export type ListboxSelectEvent = CustomEvent<ListboxSelectDetail>;

export interface ItemFocusDetail {
  item: ListItem;
  index: number;
}

export type ListItemFocusEvent = CustomEvent<ItemFocusDetail>;

/**
 * @csspart items
 * @fires {ListboxSelectEvent} select - Fires when an item is selected.
 * @fires {ListItemFocusEvent} item-focus - Fires when an item is focused
 */
export class ListBox extends InternalsAttached(LitElement) {
  @property({ type: Boolean, attribute: 'no-focus-control' })
  noFocusControl = false;

  @queryAssignedElements({ flatten: true }) slotItems!: Array<ListItem>;

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

  focusItem(item: ListItem) {
    this.listController._focusItem(item);
  }

  override render() {
    return html`<slot part="items"></slot>`;
  }

  private readonly listController = new ListController<ListItem>(this, {
    isItem: (item: HTMLElement): item is ListItem =>
      item.getAttribute('seele-base') === 'option' &&
      !item.hasAttribute('disabled') &&
      !item.hidden,
    getPossibleItems: () => this.slotItems,

    blurItem: (item: ListItem) => {
      item.focused = false;
    },
    focusItem: (item: ListItem) => {
      item.focused = true;
      if (!this.noFocusControl) {
        this[internals].ariaActiveDescendantElement = item;
      }
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

  constructor() {
    super();
    this[internals].role = 'listbox';
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    if (!isServer) {
      this.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.addEventListener('focusin', this.#handleFocusIn.bind(this));
      this.addEventListener('focusout', this.#handleFocusOut.bind(this));
      this.addEventListener('mouseover', this.#handleMouseOver.bind(this));
      this.addEventListener('click', this.#handleClick.bind(this));
    }
  }

  #handleFocusIn() {
    if (this.currentIndex === -1) {
      this.listController.focusFirstItem();
    } else {
      this.listController._focusItem(this.$items[this.currentIndex]);
    }
  }

  #handleFocusOut() {
    if (this.listController._focusedItem) {
      this.listController._blurItem(this.listController._focusedItem);
    }
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
          this.#dispatchSelect({
            item: items[currentIndex],
            index: currentIndex,
          });
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
    if (item && this.currentIndex !== item.index) {
      this.listController._focusItem(item.item);
    }
  }

  #handleClick(event: MouseEvent) {
    const item = this.#getItemFromEvent(event);
    if (!item) return;

    this.#dispatchSelect({ ...item });
  }

  #getItemFromEvent(event: Event) {
    const item = (event.target as HTMLElement).closest<ListItem>(
      '[seele-base=option]'
    );

    if (!item || !this.$items.includes(item)) return null;
    return { item, index: this.$items.indexOf(item) };
  }

  #dispatchSelect(detail: ListboxSelectDetail) {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: detail,
        bubbles: true,
        composed: true,
      })
    );
  }
}
