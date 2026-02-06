import { ReactiveController, ReactiveControllerHost } from 'lit';

import type { ListItem } from '../list-item.js';

import { getIndexByLetter } from '../menu.js';

export interface ListControllerConfig<Item extends ListItem> {
  isItem: (item: HTMLElement) => item is Item;
  getPossibleItems: () => HTMLElement[];
  blurItem: (item: Item) => void;
  focusItem: (item: Item) => void;
  isActivatable?: (item: Item) => boolean;
  wrapNavigation?: () => boolean;
}

export class ListController<
  Item extends ListItem,
> implements ReactiveController {
  host: ReactiveControllerHost;

  isItem: (item: HTMLElement) => item is Item;
  private readonly getPossibleItems: () => HTMLElement[];
  private readonly blurItem: (item: Item) => void;
  private readonly focusItem: (item: Item) => void;
  private readonly wrapNavigation: () => boolean;

  constructor(
    host: ReactiveControllerHost,
    config: ListControllerConfig<Item>
  ) {
    const { isItem, getPossibleItems, blurItem, focusItem, wrapNavigation } =
      config;

    (this.host = host).addController(this);

    this.isItem = isItem;
    this.getPossibleItems = getPossibleItems;
    this.blurItem = blurItem;
    this.focusItem = focusItem;
    this.wrapNavigation = wrapNavigation;
  }
  hostConnected(): void {}
  hostDisconnected(): void {}

  get items(): Item[] {
    return this.getPossibleItems().filter(this.isItem);
  }
  get currentIndex(): number {
    const items = this.getPossibleItems().filter(this.isItem);
    return items.findIndex((item) => item.focused) ?? -1;
  }
  _focusedIndex: number = -1;

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
      this._focusItem(items[searchIndex]);
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

  _focusItem(item: Item) {
    if (this._focusedIndex !== -1)
      this._blurItem(this.items[this._focusedIndex]);
    this.focusItem(item);
    this._focusedIndex = this.items.indexOf(item);
  }

  _blurItem(item: Item) {
    this.blurItem(item);
    this._focusedIndex = -1;
  }

  focusFirstItem() {
    this._focusItem(this.items[0]);
  }

  focusLastItem() {
    this._focusItem(this.items[this.items.length - 1]);
  }

  focusNextItem() {
    const count = this.items.length;
    if (count === 0) return;
    let nextIndex = this._focusedIndex + 1;
    if (nextIndex >= count) {
      nextIndex = this.wrapNavigation() ? count - 1 : 0;
    }
    this._focusItem(this.items[nextIndex]);
  }

  focusPreviousItem() {
    const count = this.items.length;
    if (count === 0) return;
    let prevIndex = this._focusedIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.wrapNavigation() ? 0 : count - 1;
    }
    this._focusItem(this.items[prevIndex]);
  }

  handleSlotChange() {
    this._focusedIndex = this.currentIndex;
  }
}
