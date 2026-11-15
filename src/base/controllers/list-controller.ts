import { ReactiveController, ReactiveControllerHost, isServer } from 'lit';

export interface ListControllerConfig<Item extends HTMLElement> {
  getPossibleItems: () => HTMLElement[];
  isItem: (item: HTMLElement) => item is Item;
  isDisabled?: () => boolean;
  blurItem?: (item: Item) => void;
  focusItem: (item: Item) => void;
  isActivatable?: (item: Item) => boolean;
  wrapNavigation?: () => boolean;
  onFocusin?: () => void;
}

export class ListController<
  Item extends HTMLElement,
> implements ReactiveController {
  host: ReactiveControllerHost & HTMLElement;

  private readonly __getPossibleItems: () => HTMLElement[];
  private readonly __isItem: (item: HTMLElement) => item is Item;
  private readonly __isDisabled: () => boolean;
  private readonly __blurItem: (item: Item) => void;
  private readonly __focusItem: (item: Item) => void;
  private readonly __wrapNavigation: () => boolean;
  private readonly __onFocusin: () => void;

  private __observer: MutationObserver | null = null;
  private __reconcilePending = false;
  private __hasFocusWithin = false;
  private __lastKnownIndex = -1;

  get items(): Item[] {
    return this.__getPossibleItems().filter(this.__isItem);
  }
  get currentIndex(): number {
    if (!this._focusedItem) return -1;
    return this.items.indexOf(this._focusedItem);
  }
  _focusedItem: Item | null = null;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    config: ListControllerConfig<Item>
  ) {
    const {
      getPossibleItems,
      isItem,
      isDisabled,
      blurItem,
      focusItem,
      wrapNavigation,
      onFocusin,
    } = config;

    (this.host = host).addController(this);

    this.__getPossibleItems = getPossibleItems;
    this.__isItem = isItem;
    this.__isDisabled = isDisabled ?? (() => false);
    this.__blurItem = blurItem ?? (() => {});
    this.__focusItem = focusItem;
    this.__wrapNavigation = wrapNavigation ?? (() => false);
    this.__onFocusin = onFocusin ?? (() => {});
  }

  hostConnected(): void {
    if (isServer) return;
    this.host.addEventListener('focusin', this.#handleFocusIn);
    this.host.addEventListener('focusout', this.#handleFocusOut);
    if (typeof MutationObserver !== 'undefined') {
      this.__observer = new MutationObserver(() => this.requestReconcile());
    }
    this.requestReconcile();
  }

  hostDisconnected(): void {
    if (isServer) return;
    this.host.removeEventListener('focusin', this.#handleFocusIn);
    this.host.removeEventListener('focusout', this.#handleFocusOut);
    this.__observer?.disconnect();
    this.__observer = null;
  }

  #handleFocusIn = (event: FocusEvent) => {
    if (this.__isDisabled()) return;
    this.__hasFocusWithin = true;
    const target = event.target as HTMLElement;
    if (this.__isItem(target) && this._focusedItem !== target) {
      if (this._focusedItem) this.__blurItem(this._focusedItem);
      this._focusedItem = target;
      this.__lastKnownIndex = this.items.indexOf(target);
    }
    this.__onFocusin();
  };

  #handleFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.contains(next)) {
      this.__hasFocusWithin = false;
    }
  };

  handleSlotChange() {
    this.reconcile();
  }

  private searchString = '';
  private searchTimeout: number | null = null;

  handleType(char: string) {
    const searchString = this.getSearchString(char);
    const items = this.items;
    const optionsText = items.map((item) => item.innerText);
    const searchIndex = getIndexByLetter(
      optionsText,
      searchString,
      this.currentIndex + 1
    );

    if (searchIndex >= 0) {
      this.focusItem(items[searchIndex]);
      return true;
    } else {
      if (this.searchTimeout) window.clearTimeout(this.searchTimeout);
      this.searchString = '';
      return false;
    }
  }

  private getSearchString(char: string) {
    if (this.searchTimeout) {
      window.clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = window.setTimeout(() => {
      this.searchString = '';
    }, 500);
    this.searchString += char;
    return this.searchString;
  }

  clearSearch() {
    this.searchString = '';
    if (this.searchTimeout) {
      window.clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
  }

  focusItem(item: Item) {
    if (!item || this.__isDisabled()) return;
    if (this._focusedItem && this._focusedItem !== item) {
      this.__blurItem(this._focusedItem);
    }
    this._focusedItem = item;
    this.__lastKnownIndex = this.items.indexOf(item);
    this.__focusItem(item);
  }

  blurItem(item: Item) {
    this.__blurItem(item);
    if (this._focusedItem === item) {
      this._focusedItem = null;
    }
  }

  focusFirstItem() {
    const first = this.items[0];
    if (first) this.focusItem(first);
  }

  focusLastItem() {
    const items = this.items;
    const last = items[items.length - 1];
    if (last) this.focusItem(last);
  }

  focusNextItem() {
    const items = this.items;
    const count = items.length;
    if (count === 0) return;

    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= count) {
      nextIndex = this.__wrapNavigation() ? 0 : count - 1;
    }

    this.focusItem(items[nextIndex]);
  }

  focusPreviousItem() {
    const items = this.items;
    const count = items.length;
    if (count === 0) return;

    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.__wrapNavigation() ? count - 1 : 0;
    }

    this.focusItem(items[prevIndex]);
  }

  requestReconcile() {
    if (this.__reconcilePending) return;
    this.__reconcilePending = true;
    queueMicrotask(() => {
      this.__reconcilePending = false;
      if (this.host.isConnected) {
        this.reconcile();
      }
    });
  }

  reconcile() {
    if (this.__isDisabled()) return;

    const possibleItems = this.__getPossibleItems();
    const enabledItems = possibleItems.filter(this.__isItem);

    if (this.__observer) {
      this.__observer.disconnect();
      for (const el of possibleItems) {
        this.__observer.observe(el, {
          attributes: true,
          attributeFilter: ['disabled', 'hidden', 'base'],
        });
      }
    }

    // `__hasFocusWithin` stays true even when the focused item is removed from
    // the DOM (document.activeElement then falls back to `body` without firing
    // `focusout`), so focus can still be restored to a neighbour.
    const menuHadFocus =
      this.__hasFocusWithin || this.host.contains(document.activeElement);

    const prevItem = this._focusedItem;
    let nextItem: Item | null = null;
    if (this._focusedItem && enabledItems.includes(this._focusedItem)) {
      nextItem = this._focusedItem;
    } else if (enabledItems.length > 0) {
      const fallbackIndex = Math.min(
        Math.max(this.__lastKnownIndex, 0),
        enabledItems.length - 1
      );
      nextItem = enabledItems[fallbackIndex];
    }
    this._focusedItem = nextItem;
    this.__lastKnownIndex = nextItem ? enabledItems.indexOf(nextItem) : -1;

    if (menuHadFocus && nextItem !== prevItem) {
      if (prevItem) this.__blurItem(prevItem);
      if (nextItem) {
        this.__focusItem(nextItem);
      } else {
        this.host.tabIndex = -1;
        this.host.focus();
      }
    }
  }
}

export const filterOptions = (
  options: string[] = [],
  filter: string,
  exclude: string[] = []
) => {
  return options.filter((option) => {
    const matches = option.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    return matches && exclude.indexOf(option) < 0;
  });
};

export const getIndexByLetter = (
  options: string[],
  filter: string,
  startIndex = 0
) => {
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
};
