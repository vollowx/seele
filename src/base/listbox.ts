import { List, ListItemFocusEvent } from './list.js';
import type { ListItem } from './list-item.js';

export interface ListboxSelectDetail {
  item: ListItem;
  index: number;
}

export type ListboxSelectEvent = CustomEvent<ListboxSelectDetail>;

export type { ListItemFocusEvent };

/**
 * @csspart items
 * @fires {ListboxSelectEvent} select - Fires when an item is selected.
 * @fires {ListItemFocusEvent} item-focus - Fires when an item is focused
 */
export class ListBox extends List {
  protected override _role = 'listbox';
  protected override _itemRole = 'option';

  protected override _activate(item: ListItem, index: number) {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: { item, index },
        bubbles: true,
        composed: true,
      })
    );
    this.dispatchEvent(
      new Event('request-popup-hide', { bubbles: true, composed: true })
    );
  }
}
