import { LitElement, isServer, html, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';

import { InternalsAttached } from './mixins/internals-attached.js';
import { FocusDelegated } from './mixins/focus-delegated.js';
import { FormAssociated } from './mixins/form-associated.js';
import { SelectAPIMixin } from './mixins/select-api-mixin.js';

import type { Option } from './option.js';
import type { Popup } from './popup.js';
import type {
  ListBox,
  ListboxItemFocusEvent,
  ListboxSelectEvent,
} from './listbox.js';
import { getActionFromKey, MenuAction } from './menu.js';

const Base = SelectAPIMixin(
  FormAssociated(FocusDelegated(InternalsAttached(LitElement)))
);

/**
 * @csspart field
 * @csspart popup
 * @csspart listbox
 *
 * @fires {Event} change - Fires when the value is changed.
 * @fires {Event} input - Fires when the value is changed.
 */
export class Select extends Base {
  @property({ type: Boolean }) error = false;
  @property({ type: Boolean }) open = false;
  @property({ type: Boolean, reflect: true }) bare = false;

  /**
   * Text to display in the field. Only set for SSR.
   */
  @property({ attribute: 'display-text' }) displayText = '';

  override get $allItems() {
    return this.$listbox?.$allItems ?? [];
  }

  @query('[part=field]') $field!: any;
  @query('[part=popup]') $popup!: Popup;
  @query('[part=listbox]') $listbox!: ListBox;

  get $items() {
    return this.$listbox?.$items ?? [];
  }
  get $slotItems() {
    return this.$listbox?.$slotItems ?? [];
  }
  get currentIndex() {
    return this.$listbox?.currentIndex ?? -1;
  }
  override _managesDefaultSelection() {
    return !this.bare;
  }

  focusFirstItem() {
    this.$listbox?.focusFirstItem();
  }
  focusLastItem() {
    this.$listbox?.focusLastItem();
  }
  focusItem(item: Option) {
    this.$listbox?.focusItem(item);
  }
  clearFocus() {
    this.$listbox?.clearFocus();
  }
  handleKeydown(event: KeyboardEvent) {
    this.$listbox?.handleKeydown(event);
  }

  selectItem(item: Option | null) {
    if (!this.$listbox) throw new Error('The listbox is not ready.');
    this.$listbox.multiple = this.multiple;
    this.$listbox.selectItem(item);
    this._selectionSet();
  }

  override render() {
    return html`${this.renderField()}${this.renderListbox()}`;
  }

  /**
   * Check example content from the m3 implementation
   */
  protected renderField() {
    return html``;
  }

  /**
   * Check example content from the m3 implementation
   */
  protected renderListbox() {
    return html``;
  }

  protected renderFieldContent() {
    return html`<span part="value">${this.displayText || html`&nbsp;`}</span>`;
  }

  constructor() {
    super();
    if (!isServer) {
      this.addEventListener('focusout', this.#handleFocusOut.bind(this));
    }
  }

  protected override updated(changed: PropertyValues) {
    super.updated(changed);

    if (changed.has('open')) {
      if (this.open) {
        this.#focusSelectedItemOrFirst();
      } else {
        this.$field.ariaActiveDescendantElement = null;
      }
    }
  }

  protected _handleFieldKeydown(event: KeyboardEvent) {
    if (this._disabled || this.bare) return;

    if (!this.open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        this.open = true;
        return;
      }
      const action = getActionFromKey(event);
      if (action === MenuAction.Type) {
        this.open = true;
      } else {
        return;
      }
    }

    if (this.open) this.$listbox.handleKeydown(event);
  }

  protected _handleListboxSelect(event: ListboxSelectEvent) {
    if (this._disabled) return;
    if (this.bare) return;
    this.$listbox.multiple = this.multiple;
    const item = event.detail.item;
    const previous = item.selected;
    if (this.multiple) {
      item.selected = !item.selected;
      this._selectionSet();
    } else {
      this.selectItem(item);
    }
    if (previous !== item.selected) {
      this.#dispatchChangeEvent();
      this.$field.focus();
    }
  }

  protected _handleListItemFocus(event: ListboxItemFocusEvent) {
    if (!this.bare) this.$field.ariaActiveDescendantElement = event.detail.item;
  }

  #handleFocusOut(event: FocusEvent) {
    if (!this.open) return;

    const target = event.relatedTarget as Node | null;

    if (target && this.contains(target)) {
      return;
    }

    if (target) {
      this.$popup.hide();
      return;
    }

    requestAnimationFrame(() => {
      if (!document.hasFocus()) this.$popup.hide();
    });
  }

  protected async _handleSlotChange() {
    await this.$listbox?.updateComplete;
    if (this.isConnected) this._reconcileSelection();
  }

  override _selectionChanged() {
    const selected = this.$selectedItems;
    if (selected.length) {
      this.displayText = selected
        .map((option) => option.displayText)
        .join(', ');
    } else if (this.$allItems.length || !this.displayText) {
      this.displayText = '';
    }
  }

  #dispatchChangeEvent = () => {
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true }));
  };

  #focusSelectedItemOrFirst() {
    // Defer until the popover is shown, otherwise focusing a hidden option is a
    // no-op.
    requestAnimationFrame(() => {
      if (!this.open) return;
      const item = this.$selectedItems[0];
      if (item && this.$listbox.$items.includes(item)) {
        this.$listbox.focusItem(item);
      } else {
        this.$listbox.focusFirstItem();
      }
    });
  }

  override formDisabledCallback(disabled: boolean) {
    super.formDisabledCallback(disabled);
    if (disabled) this.open = false;
  }

  toggle() {
    if (this._disabled) return;
    this.open = !this.open;
  }
}
