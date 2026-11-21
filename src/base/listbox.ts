import { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { List, ListItemFocusEvent } from './list.js';
import type { ListItem } from './listitem.js';
import { internals } from './mixins/internals-attached.js';

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

  @property({ type: Boolean, reflect: true }) multiple = false;

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('multiple')) {
      this[internals].ariaMultiSelectable = this.multiple ? 'true' : null;
    }
  }

  protected override _activate(item: ListItem, index: number) {
    if (!this.bare) {
      if (this.multiple) {
        item.selected = !item.selected;
      } else {
        for (const option of this.$items) {
          option.selected = option === item;
        }
      }
    }
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
