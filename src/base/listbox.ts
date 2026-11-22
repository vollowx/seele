import { PropertyValues, html, isServer } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { focusVisible, setFocusVisible } from '../core/focus.js';

import { internals } from './mixins/internals-attached.js';
import { FormAssociated } from './mixins/form-associated.js';
import { SelectAPIMixin } from './mixins/select-api-mixin.js';
import { ListController } from './controllers/list-controller.js';

import { List } from './list.js';
import type { Option } from './option.js';
import { MenuAction, getActionFromKey, getVisibleItems } from './menu.js';

export interface OptionDetail {
  item: Option;
  index: number;
}

export type ListboxItemFocusEvent = CustomEvent<OptionDetail>;
export type ListboxSelectEvent = CustomEvent<OptionDetail>;
export type ListboxSelectDetail = OptionDetail;

/**
 * @csspart items
 * @fires {ListboxSelectEvent} select - Fires when an item is selected.
 * @fires {ListboxItemFocusEvent} item-focus - Fires when an item is focused.
 */
export class ListBox extends SelectAPIMixin(FormAssociated(List)) {
  protected override _role = 'listbox';
  protected _itemRole = 'option';

  /**
   * When true, the list does not own focus and doesn't update its
   * `aria-activedescendant`, an external control (e.g. a select's combobox
   * field) should then take over the works.
   */
  @property({ type: Boolean, reflect: true }) bare = false;

  @queryAssignedElements({ flatten: true }) $slotItems!: Array<HTMLElement>;

  override get $allItems() {
    return (this.$slotItems ?? []).filter((item) => this.#isItem(item));
  }

  get $items() {
    return this.listController.items;
  }

  override _managesDefaultSelection() {
    return !this.bare;
  }

  #savedTabIndex: string | null | undefined;

  override _syncTabIndex() {
    if (this._disabled) {
      if (this.#savedTabIndex === undefined) {
        this.#savedTabIndex = this.getAttribute('tabindex');
      }
      this.setAttribute('tabindex', '-1');
    } else if (this.#savedTabIndex !== undefined) {
      const previous = this.#savedTabIndex;
      this.#savedTabIndex = undefined;
      if (previous === null) this.removeAttribute('tabindex');
      else this.setAttribute('tabindex', previous);
    } else if (!this.bare) {
      super._syncTabIndex();
    }
  }

  override formDisabledCallback(disabled: boolean) {
    super.formDisabledCallback(disabled);
    this._syncTabIndex();
  }

  selectItem(item: Option | null) {
    const items = this.$allItems;
    if (item && !items.includes(item)) {
      throw new RangeError('The item does not belong to this listbox.');
    }
    for (const option of items) {
      const selected =
        this.multiple && item
          ? option.selected || option === item
          : option === item;
      if (option.selected !== selected) option.selected = selected;
    }
    this._selectionSet();
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

  focusItem(item: Option) {
    this.listController.focusItem(item);
  }

  clearFocus() {
    const item = this.listController.focusedItem;
    if (item) this.listController.blurItem(item);
  }

  override render() {
    return html`<slot
      part="items"
      @slotchange=${this.#handleSlotChange}
    ></slot>`;
  }

  constructor() {
    super();
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

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
  }

  #handleSlotChange = () => {
    this.listController.handleSlotChange();
    this._reconcileSelection();
  };

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('multiple')) {
      this[internals].ariaMultiSelectable = this.multiple ? 'true' : null;
    }
  }

  private readonly listController = new ListController<Option>(this, {
    isItem: (item: HTMLElement): item is Option =>
      this.#isItem(item) && !item.hasAttribute('disabled') && !item.hidden,
    getPossibleItems: () => this.$slotItems,
    blurItem: (item: Option) => {
      item.focused = false;
    },
    focusItem: (item: Option) => {
      const alreadyFocused = item.focused;
      item.focused = true;
      // The same item can regain focus with a different input modality.
      if (alreadyFocused) item.requestUpdate('focused', false);
      if (!this.bare) {
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
    focusTracking: {},
    handleReconcile: (prev, next) => {
      if (!next && !this.bare) {
        this[internals].ariaActiveDescendantElement = null;
      } else if (prev !== next && next && this.listController.hasFocusWithin) {
        this.listController.focusItem(next);
      }
    },
  });

  #isItem(item: HTMLElement): item is Option {
    return item.getAttribute('seele-base') === this._itemRole;
  }

  #handleFocusIn() {
    if (this.bare) return;
    if (this.currentIndex === -1) {
      this.listController.focusFirstItem();
    } else {
      this.listController.focusItem(this.$items[this.currentIndex]);
    }
  }

  #handleFocusOut() {
    this.clearFocus();
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this._disabled) return;
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
        this.listController.focusItem(
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
      case MenuAction.Close:
        event.preventDefault();
        this.dispatchEvent(
          new Event('request-popup-hide', { bubbles: true, composed: true })
        );
        return;
      case MenuAction.CloseSelect:
        event.preventDefault();
        if (currentIndex >= 0) {
          this._activate(items[currentIndex], currentIndex);
        }
        return;
      case MenuAction.Type:
        this.listController.handleType(event.key);
        return;
    }
  }

  #handleMouseOver(event: MouseEvent) {
    const wasFocusVisible = focusVisible;
    setFocusVisible(false);
    const item = this.#getItemFromEvent(event);
    if (item && this.currentIndex !== item.index) {
      this.listController.focusItem(item.item);
    } else if (wasFocusVisible && this.listController.focusedItem) {
      this.listController.focusItem(this.listController.focusedItem);
    }
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

    this.#suppressClick = true;
    this.listController.focusItem(item.item);
    this._activate(item.item, item.index);
  }

  #handleClick(event: MouseEvent) {
    if (this.#suppressClick) {
      this.#suppressClick = false;
      return;
    }

    const item = this.#getItemFromEvent(event);
    if (!item) return;
    this.listController.focusItem(item.item);
    this._activate(item.item, item.index);
  }

  #getItemFromEvent(event: Event) {
    if (this._disabled) return null;
    const item = (event.target as HTMLElement).closest<Option>(
      `[seele-base=${this._itemRole}]`
    );
    if (!item || !this.$items.includes(item)) return null;
    return { item, index: this.$items.indexOf(item) };
  }

  protected _activate(item: Option, index: number) {
    if (!this.bare) {
      const previous = item.selected;
      if (this.multiple) {
        item.selected = !item.selected;
        this._selectionSet();
      } else {
        this.selectItem(item);
      }
      if (previous !== item.selected) {
        this.dispatchEvent(
          new Event('input', { bubbles: true, composed: true })
        );
        this.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: { item, index },
        bubbles: true,
        composed: true,
      })
    );
    if (!this.multiple) {
      this.dispatchEvent(
        new Event('request-popup-hide', { bubbles: true, composed: true })
      );
    }
  }
}
