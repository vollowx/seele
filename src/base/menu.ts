import { LitElement, html } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';

import type { Placement, Strategy } from '@floating-ui/dom';
import type { MenuItem } from './menu-item.js';

import { setFocusVisible } from '../core/focus-visible.js';
import { Attachable } from './mixins/attachable.js';
import { InternalsAttached } from './mixins/internals-attached.js';
import { FocusDelegated } from './mixins/focus-delegated.js';
import { PopoverController } from './controllers/popover-controller.js';
import { ListController } from './controllers/list-controller.js';

const Base = FocusDelegated(InternalsAttached(Attachable(LitElement)));

interface MenuSelectDetail {
  item: MenuItem;
  index: number;
}
export type MenuSelectEvent = CustomEvent<MenuSelectDetail>;

interface ItemFocusDetail {
  item: MenuItem;
}
export type MenuItemFocusEvent = CustomEvent<ItemFocusDetail>;

/**
 * @csspart menu
 * @csspart items
 *
 * @fires {Event} open - Fires when the menu is opened.
 * @fires {Event} close - Fires when the menu is closed.
 * @fires {MenuSelectEvent} select - Fires when an item is selected.
 * @fires {MenuItemFocusEvent} item-focus - Fires when an item is focused
 *
 * FIXME: aria-activedescendant may not work in and out shadow DOM
 */
export class Menu extends Base {
  readonly _possibleItemTags: string[] = [];
  readonly _durations = { show: 0, hide: 0 };
  readonly _scrollPadding: number = 0;

  @property() type: string = 'menu';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) quick = false;
  @property({ type: Number }) offset = 0;
  @property({ reflect: true })
  align: Placement = 'bottom-start';
  @property({ type: String, reflect: true, attribute: 'align-strategy' })
  alignStrategy: Strategy = 'absolute';
  @property({ type: Boolean, attribute: 'keep-open-blur' })
  keepOpenBlur = false;
  @property({ type: Boolean, attribute: 'keep-open-click-item' })
  keepOpenClickItem = false;
  @property({ type: Boolean, attribute: 'keep-open-click-away' })
  keepOpenClickAway = false;
  @property({ type: Boolean, attribute: 'no-list-control' })
  noListControl = false;
  @property({ type: Boolean, attribute: 'no-focus-control' })
  noFocusControl = false;

  @property({ type: Number, attribute: 'data-tabindex' })
  override tabIndex = 0;

  @query('[part="menu"]') $menu!: HTMLElement;
  @queryAssignedElements({ flatten: true }) slotItems!: Array<
    MenuItem | HTMLElement
  >;
  get $items() {
    return this.listController.items || [];
  }
  private $lastFocused: HTMLElement | null = null;

  private readonly popoverController = new PopoverController(this, {
    popover: () => this.$menu,
    trigger: () => this.$control,
    positioning: {
      placement: () => this.align,
      strategy: () => this.alignStrategy,
      offset: () => this.offset,
      windowPadding: () => 16,
    },
    durations: {
      open: () => (this.quick ? 0 : this._durations.show),
      close: () => (this.quick ? 0 : this._durations.hide),
    },
    onClickAway: () => {
      if (!this.keepOpenClickAway) this.open = false;
    },
  });

  private readonly listController = new ListController<MenuItem>(this, {
    isItem: (item: HTMLElement): item is MenuItem =>
      this._possibleItemTags.includes(item.tagName.toLowerCase()) &&
      !item.hasAttribute('disabled'),
    getPossibleItems: () => this.slotItems,
    blurItem: (item: MenuItem) => {
      item.focused = false;
    },
    focusItem: (item: MenuItem) => {
      item.focused = true;
      if (!this.noFocusControl)
        this.$menu.setAttribute('aria-activedescendant', item.id);
      scrollItemIntoView(this.$menu, item, this._scrollPadding);
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
      part="menu"
      role="${this.type}"
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
    if (changed.has('open')) {
      if (this.open) {
        this.dispatchEvent(
          new Event('open', { bubbles: true, composed: true })
        );

        this.$lastFocused = document.activeElement as HTMLElement;
        if (this.$control) {
          this.$control.ariaExpanded = 'true';
        }

        this.popoverController.animateOpen().then(() => {
          if (!this.noFocusControl) {
            this.$menu.focus();
            this.listController.focusFirstItem();
          }
        });
      } else {
        this.dispatchEvent(
          new Event('close', { bubbles: true, composed: true })
        );

        this.listController.clearSearch();

        if (this.$control) {
          this.$control.ariaExpanded = 'false';
        }

        this.popoverController.animateClose().then(() => {
          if (this.$lastFocused) {
            if (!this.noFocusControl) this.$lastFocused.focus();
            this.$lastFocused = null;
          }
        });
      }
    }
  }

  #handleKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;

    const action = getActionFromKey(event, this.open);
    const items = this.$items;
    const currentIndex = this.listController.currentIndex;
    const maxIndex = items.length - 1;

    switch (action) {
      case MenuActions.Last:
      case MenuActions.First:
        this.open = true;
      // intentional fallthrough
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
          if (this.keepOpenClickItem) return;
          this.open = false;
        }
        return;
      case MenuActions.Close:
        event.preventDefault();
        this.open = false;
        return;
      case MenuActions.Type:
        this.open = true;
        this.listController.handleType(event.key);
        return;
      case MenuActions.Open:
        event.preventDefault();
        this.open = true;
        return;
    }
  }

  #handleFocusOut(event: FocusEvent) {
    if (this.keepOpenBlur) return;
    const newFocus = event.relatedTarget as Node;
    const isInside =
      this.contains(newFocus) ||
      this.shadowRoot?.contains(newFocus) ||
      this.$control?.contains(newFocus);
    if (!isInside) {
      this.open = false;
    }
  }

  #handleItemMouseOver(event: Event) {
    setFocusVisible(false);
    const hoveredItem = event.currentTarget as MenuItem;
    this.listController._focusItem(hoveredItem);
  }

  #handleItemClick(event: Event) {
    const clickedItem = event.currentTarget as MenuItem;
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

    if (!this.keepOpenClickItem) this.open = false;
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

  show() {
    this.open = true;
  }
  close() {
    this.open = false;
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

export function getActionFromKey(event: KeyboardEvent, menuOpen: boolean) {
  const { key, altKey, ctrlKey, metaKey } = event;
  const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' '];

  if (!menuOpen && openKeys.includes(key)) {
    return MenuActions.Open;
  }

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

  if (menuOpen) {
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
  }
  return undefined;
}

export function getIndexByLetter(
  options: string[],
  filter: string,
  startIndex = 0
) {
  const orderedOptions = [
    ...options.slice(startIndex),
    ...options.slice(0, startIndex),
  ];
  const firstMatch = filterOptions(orderedOptions, filter)[0];
  const allSameLetter = (array: string[]) =>
    array.every((letter) => letter === array[0]);

  if (firstMatch) {
    return options.indexOf(firstMatch);
  } else if (allSameLetter(filter.split(''))) {
    const matches = filterOptions(orderedOptions, filter[0]);
    return options.indexOf(matches[0]);
  } else {
    return -1;
  }
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
  menu: HTMLElement,
  item: HTMLElement,
  paddingY: number = 0
) {
  if (!menu) return;

  // Basic scroll into view logic
  const menuRect = menu.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();

  if (itemRect.bottom + paddingY > menuRect.bottom) {
    menu.scrollTop += itemRect.bottom - menuRect.bottom + paddingY;
  } else if (itemRect.top - paddingY < menuRect.top) {
    menu.scrollTop -= menuRect.top - itemRect.top + paddingY;
  }
}
