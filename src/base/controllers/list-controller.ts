import { ReactiveController, ReactiveControllerHost, isServer } from 'lit';

export interface ListControllerConfig<Item extends HTMLElement> {
  getPossibleItems: () => HTMLElement[];
  isItem: (item: HTMLElement) => item is Item;
  blurItem?: (item: Item) => void;
  focusItem: (item: Item) => void;
  wrapNavigation?: () => boolean;
  /** Opt in to tracking DOM focus inside the host. */
  focusTracking?: {
    enabled?: () => boolean;
    handleFocusIn?: () => void;
  };
  /** Called after the item collection or its current item is reconciled. */
  handleReconcile?: (prev: Item | null, next: Item | null) => void;
}

export class ListController<
  Item extends HTMLElement,
> implements ReactiveController {
  host: ReactiveControllerHost & HTMLElement;
  private readonly __config: ListControllerConfig<Item>;

  private __observer: MutationObserver | null = null;
  private __reconcilePending = false;
  // Removing a focused item may not fire focusout, so we track if focus is
  // within manually.
  private __hasFocusWithin = false;
  private __lastKnownIndex = -1;

  get items(): Item[] {
    return this.__config.getPossibleItems().filter(this.__config.isItem);
  }
  get currentIndex(): number {
    return this.focusedItem ? this.items.indexOf(this.focusedItem) : -1;
  }
  get hasFocusWithin(): boolean {
    return (
      !isServer &&
      (this.__hasFocusWithin || this.host.contains(document.activeElement))
    );
  }
  focusedItem: Item | null = null;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    config: ListControllerConfig<Item>
  ) {
    this.__config = { ...config };
    (this.host = host).addController(this);
  }

  hostConnected(): void {
    if (isServer) return;
    if (this.__config.focusTracking) {
      this.host.addEventListener('focusin', this.#handleFocusIn);
      this.host.addEventListener('focusout', this.#handleFocusOut);
    }
    if (typeof MutationObserver !== 'undefined') {
      this.__observer = new MutationObserver(() => this.requestReconcile());
    }
    this.requestReconcile();
  }

  hostDisconnected(): void {
    if (isServer) return;
    if (this.__config.focusTracking) {
      this.host.removeEventListener('focusin', this.#handleFocusIn);
      this.host.removeEventListener('focusout', this.#handleFocusOut);
      this.__hasFocusWithin = false;
    }
    this.__observer?.disconnect();
    this.__observer = null;
  }

  #handleFocusIn = (event: FocusEvent) => {
    if (this.__config.focusTracking?.enabled?.() === false) return;
    this.__hasFocusWithin = true;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      this.__config.isItem(target) &&
      this.focusedItem !== target
    ) {
      this.trackItem(target);
    }
    this.__config.focusTracking?.handleFocusIn?.();
  };

  #handleFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !this.host.contains(next)) {
      this.__hasFocusWithin = false;
    }
  };

  resetFocusTracking() {
    this.__hasFocusWithin = false;
  }

  handleSlotChange = () => this.reconcile();

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
    }
    this.clearSearch();
    return false;
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

  trackItem(item: Item) {
    if (this.focusedItem && this.focusedItem !== item) {
      this.__config.blurItem?.(this.focusedItem);
    }
    this.focusedItem = item;
    this.__lastKnownIndex = this.items.indexOf(item);
  }

  focusItem(item: Item) {
    if (!item) return;
    this.trackItem(item);
    this.__config.focusItem(item);
  }

  blurItem(item: Item) {
    this.__config.blurItem?.(item);
    if (this.focusedItem === item) this.focusedItem = null;
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
      nextIndex = this.__config.wrapNavigation?.() ? 0 : count - 1;
    }

    this.focusItem(items[nextIndex]);
  }

  focusPreviousItem() {
    const items = this.items;
    const count = items.length;
    if (count === 0) return;

    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.__config.wrapNavigation?.() ? count - 1 : 0;
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
    const possibleItems = this.__config.getPossibleItems();
    const enabledItems = possibleItems.filter(this.__config.isItem);

    if (this.__observer) {
      this.__observer.disconnect();
      for (const el of possibleItems) {
        this.__observer.observe(el, {
          attributes: true,
          attributeFilter: ['disabled', 'hidden', 'seele-base'],
        });
      }
    }

    const prevItem = this.focusedItem;
    const fallbackIndex = Math.min(
      Math.max(this.__lastKnownIndex, 0),
      enabledItems.length - 1
    );
    const nextItem =
      prevItem && enabledItems.includes(prevItem)
        ? prevItem
        : (enabledItems[fallbackIndex] ?? null);
    this.focusedItem = nextItem;
    this.__lastKnownIndex = nextItem ? enabledItems.indexOf(nextItem) : -1;

    if (nextItem !== prevItem && prevItem) this.__config.blurItem?.(prevItem);
    this.__config.handleReconcile?.(prevItem, nextItem);
  }
}

export function rovingFocusPreset<Item extends HTMLElement>(
  getController: () => ListController<Item>,
  enabled?: () => boolean
) {
  const rearrange = () => {
    if (enabled?.() === false) return;
    const { items, focusedItem } = getController();
    const active =
      focusedItem && items.includes(focusedItem) ? focusedItem : items[0];
    for (const item of items) item.tabIndex = item === active ? 0 : -1;
  };

  return {
    rearrange,
    focusTracking: { enabled, handleFocusIn: rearrange },
    handleReconcile: (prev: Item | null, next: Item | null) => {
      if (enabled?.() === false) return;
      const controller = getController();
      if (prev !== next && controller.hasFocusWithin) {
        if (next) controller.focusItem(next);
        else {
          controller.host.tabIndex = -1;
          controller.host.focus();
        }
      }
      rearrange();
    },
  };
}

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
