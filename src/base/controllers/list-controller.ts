import { ReactiveController, ReactiveControllerHost } from 'lit';

export interface ListControllerConfig<Item extends HTMLElement> {
  isItem: (item: HTMLElement) => item is Item;
  getPossibleItems: () => HTMLElement[];
  blurItem: (item: Item) => void;
  focusItem: (item: Item) => void;
  isActivatable?: (item: Item) => boolean;
  wrapNavigation?: () => boolean;
}

export class ListController<
  Item extends HTMLElement,
> implements ReactiveController {
  host: ReactiveControllerHost;

  private readonly __isItem: (item: HTMLElement) => item is Item;
  private readonly __getPossibleItems: () => HTMLElement[];
  private readonly __blurItem: (item: Item) => void;
  private readonly __focusItem: (item: Item) => void;
  private readonly __wrapNavigation: () => boolean;

  constructor(
    host: ReactiveControllerHost,
    config: ListControllerConfig<Item>
  ) {
    const { isItem, getPossibleItems, blurItem, focusItem, wrapNavigation } =
      config;

    (this.host = host).addController(this);

    this.__isItem = isItem;
    this.__getPossibleItems = getPossibleItems;
    this.__blurItem = blurItem;
    this.__focusItem = focusItem;
    this.__wrapNavigation = wrapNavigation ?? (() => false);
  }
  hostConnected(): void {}
  hostDisconnected(): void {}

  get items(): Item[] {
    return this.__getPossibleItems().filter(this.__isItem);
  }
  get currentIndex(): number {
    if (!this._focusedItem) return -1;
    return this.items.indexOf(this._focusedItem);
  }
  _focusedItem: Item | null = null;

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
    if (this._focusedItem !== null) this.blurItem(this._focusedItem);
    this.__focusItem(item);
    this._focusedItem = item;
  }

  blurItem(item: Item) {
    this.__blurItem(item);
    this._focusedItem = null;
  }

  focusFirstItem() {
    this.focusItem(this.items[0]);
  }

  focusLastItem() {
    this.focusItem(this.items[this.items.length - 1]);
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

  handleSlotChange() {
    const items = this.items;
    const index = this.currentIndex;
    this._focusedItem = index >= 0 ? items[index] : null;
  }
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
