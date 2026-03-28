import { LitElement, html } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';

import type { ListItem } from './list-item.js';

import { setFocusVisible } from '../core/focus-visible.js';
import { Attachable } from './mixins/attachable.js';
import { InternalsAttached } from './mixins/internals-attached.js';
import { FocusDelegated } from './mixins/focus-delegated.js';
import { ListController } from './controllers/list-controller.js';

const Base = FocusDelegated(InternalsAttached(Attachable(LitElement)));

interface ListSelectDetail {
  item: ListItem;
  index: number;
}
export type ListSelectEvent = CustomEvent<ListSelectDetail>;

interface ItemFocusDetail {
  item: ListItem;
}
export type ListItemFocusEvent = CustomEvent<ItemFocusDetail>;

/**
 * @csspart list
 * @csspart items
 *
 * @fires {Event} open - Fires when the menu is opened.
 * @fires {Event} close - Fires when the menu is closed.
 * @fires {ListSelectEvent} select - Fires when an item is selected.
 * @fires {ListItemFocusEvent} item-focus - Fires when an item is focused
 */
export class List extends Base {
  readonly _possibleItemTags: string[] = [];
  readonly _scrollPadding: number = 0;

  @property({ type: Boolean, attribute: 'no-focus-control' })
  noFocusControl = false;

  @property({ type: Number, attribute: 'data-tabindex' })
  override tabIndex = 0;

  @query('[part="list"]') $list!: HTMLElement;
  @queryAssignedElements({ flatten: true }) slotItems!: Array<
    ListItem | HTMLElement
  >;
  get $items() {
    return this.listController.items || [];
  }

  private readonly listController = new ListController<ListItem>(this, {
    isItem: (item: HTMLElement): item is ListItem =>
      this._possibleItemTags.includes(item.tagName.toLowerCase()) &&
      !item.hasAttribute('disabled') &&
      !item.hidden,
    getPossibleItems: () => this.slotItems,
    blurItem: (item: ListItem) => {
      console.log(item);
      item.focused = false;
    },
    focusItem: (item: ListItem) => {
      item.focused = true;
      if (!this.noFocusControl) {
        this.$list.ariaActiveDescendantElement = item;
      }
      scrollItemIntoView(this.$list, item, this._scrollPadding);
      this.dispatchEvent(
        new CustomEvent('item-focus', {
          detail: { item: item },
          bubbles: true,
          composed: true,
        })
      );
    },
    wrapNavigation: () => false,
  });

  override render() {
    return html`<div
      part="list"
      role="list"
      tabindex="${this.tabIndex}"
      @keydown=${this.#handleKeyDown.bind(this)}
      @focusout=${this.#handleFocusOut.bind(this)}
    >
      ${this.renderItemSlot()}
    </div>`;
  }

  renderItemSlot() {
    return html`<slot part="items"></slot>`;
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.$control) {
      // TODO: Manage $control ARIA attributes
      // TODO: Handle $control change
      this.$control.addEventListener(
        'focusout',
        this.#handleFocusOut.bind(this)
      );
    }
    this.updateComplete.then(() => {
      this.$items.forEach((item) => {
        item.addEventListener(
          'mouseover',
          this.#handleItemMouseOver.bind(this)
        );
        item.addEventListener('click', this.#handleItemClick.bind(this));
      });
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.$control) {
      this.$control.removeEventListener(
        'focusout',
        this.#handleFocusOut.bind(this)
      );
    }
  }

  protected override updated(changed: Map<string, any>) {
    // TODO: Find somewhere to put this
    // this.listController.clearSearch();
  }

  #handleKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;

    const action = getActionFromKey(event);
    const items = this.$items;
    const currentIndex = this.listController.currentIndex;
    const maxIndex = items.length - 1;

    switch (action) {
      case MenuActions.Last:
      case MenuActions.First:
      case MenuActions.Next:
      case MenuActions.Previous:
      case MenuActions.PageUp:
      case MenuActions.PageDown:
        event.preventDefault();
        const nextIndex = getUpdatedIndex(currentIndex, maxIndex, action!);
        this.listController._focusItem(items[nextIndex]);
        return;
      case MenuActions.CloseSelect:
        event.preventDefault();
        if (currentIndex >= 0) {
          items[currentIndex].focused = false;
          this.dispatchEvent(
            new CustomEvent('select', {
              detail: {
                item: items[currentIndex],
                index: currentIndex,
              },
              bubbles: true,
              composed: true,
            })
          );
        }
        return;
      case MenuActions.Type:
        this.listController.handleType(event.key);
        return;
    }
  }

  #handleFocusOut(event: FocusEvent) {
    const newFocus = event.relatedTarget as Node;
    const isInside =
      this.contains(newFocus) ||
      this.shadowRoot?.contains(newFocus) ||
      this.$control?.contains(newFocus);
    if (!isInside) {
      // TODO: Clear focus rings
    }
  }

  #handleItemMouseOver(event: Event) {
    setFocusVisible(false);
    const hoveredItem = event.currentTarget as ListItem;
    this.listController._focusItem(hoveredItem);
  }

  #handleItemClick(event: Event) {
    const clickedItem = event.currentTarget as ListItem;
    const index = this.listController.items.indexOf(clickedItem);

    this.listController.items[index].focused = false;
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: {
          item: clickedItem,
          index: index,
        },
        bubbles: true,
        composed: true,
      })
    );
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
}

// Reference: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
export const MenuActions = {
  Close: 0,
  CloseSelect: 1,
  First: 2,
  Last: 3,
  Next: 4,
  Open: 5,
  PageDown: 6,
  PageUp: 7,
  Previous: 8,
  Select: 9,
  Type: 10,
};

export function filterOptions(
  options: string[] = [],
  filter: string,
  exclude: string[] = []
) {
  return options.filter((option) => {
    const matches = option.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    return matches && exclude.indexOf(option) < 0;
  });
}

export function getActionFromKey(event: KeyboardEvent) {
  const { key, altKey, ctrlKey, metaKey } = event;

  if (key === 'Home') {
    return MenuActions.First;
  }
  if (key === 'End') {
    return MenuActions.Last;
  }

  if (
    key === 'Backspace' ||
    key === 'Clear' ||
    (key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey)
  ) {
    return MenuActions.Type;
  }

  if (key === 'ArrowUp' && altKey) {
    return MenuActions.CloseSelect;
  } else if (key === 'ArrowDown' && !altKey) {
    return MenuActions.Next;
  } else if (key === 'ArrowUp') {
    return MenuActions.Previous;
  } else if (key === 'PageUp') {
    return MenuActions.PageUp;
  } else if (key === 'PageDown') {
    return MenuActions.PageDown;
  } else if (key === 'Escape') {
    return MenuActions.Close;
  } else if (key === 'Enter' || key === ' ') {
    return MenuActions.CloseSelect;
  }
  return undefined;
}

export function getUpdatedIndex(
  currentIndex: number,
  maxIndex: number,
  action: number
) {
  const pageSize = 10;

  switch (action) {
    case MenuActions.First:
      return 0;
    case MenuActions.Last:
      return maxIndex;
    case MenuActions.Previous:
      return Math.max(0, currentIndex - 1);
    case MenuActions.Next:
      return Math.min(maxIndex, currentIndex + 1);
    case MenuActions.PageUp:
      return Math.max(0, currentIndex - pageSize);
    case MenuActions.PageDown:
      return Math.min(maxIndex, currentIndex + pageSize);
    default:
      return currentIndex;
  }
}

export function scrollItemIntoView(
  list: HTMLElement,
  item: HTMLElement,
  paddingY: number = 0
) {
  if (!list) return;

  // Basic scroll into view logic
  const menuRect = list.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();

  if (itemRect.bottom + paddingY > menuRect.bottom) {
    list.scrollTop += itemRect.bottom - menuRect.bottom + paddingY;
  } else if (itemRect.top - paddingY < menuRect.top) {
    list.scrollTop -= menuRect.top - itemRect.top + paddingY;
  }
}
