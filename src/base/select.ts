import { LitElement, isServer, html, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';

import { InternalsAttached } from './mixins/internals-attached.js';
import { FocusDelegated } from './mixins/focus-delegated.js';
import { FormAssociated } from './mixins/form-associated.js';

import type { Option } from './option.js';
import type { Popup } from './popup.js';
import type {
  Menu,
  MenuItemFocusEvent,
  MenuActionEvent,
} from './menu.js';
import { getActionFromKey, MenuAction } from './menu.js';

const VALUE = Symbol('value');

const Base = FormAssociated(FocusDelegated(InternalsAttached(LitElement)));

/**
 * @csspart field
 * @csspart popup
 * @csspart menu
 *
 * @fires {Event} change - Fires when the value is changed.
 * @fires {Event} input - Fires when the value is changed.
 *
 * TODO: Render multiple values
 */
export class Select extends Base {
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean }) error = false;
  @property({ type: Boolean }) open = false;

  /**
   * Text to display in the field. Only set for SSR.
   */
  @property({ attribute: 'display-text' }) displayText = '';

  @property()
  get value(): string {
    return this[VALUE];
  }
  set value(value: string) {
    if (isServer) return;
    this.lastUserSetValue = value;
    this.select(value);
  }

  [VALUE] = '';

  get $options(): Option[] {
    return (this.$menu?.$items as Option[]) || [];
  }

  @property({ type: Number, attribute: 'selected-index' })
  get selectedIndex(): number {
    const selectedOptions = this.getSelectedOptions() ?? [];
    if (selectedOptions.length > 0) {
      return selectedOptions[0][1];
    }
    return -1;
  }

  set selectedIndex(index: number) {
    this.lastUserSetSelectedIndex = index;
    this.selectIndex(index);
  }

  get selectedOptions() {
    return (this.getSelectedOptions() ?? []).map(([option]) => option);
  }

  @query('[part=field]') $field!: any;
  @query('[part=popup]') $popup!: Popup;
  @query('[part=menu]') $menu!: Menu;

  private lastUserSetValue: string | null = null;
  private lastUserSetSelectedIndex: number | null = null;
  private lastSelectedOption: Option | null = null;
  private lastSelectedOptionRecords: [Option, number][] = [];

  override render() {
    return html`${this.renderField()}${this.renderMenu()}`;
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
  protected renderMenu() {
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

  protected override async firstUpdated(changed: PropertyValues<Select>) {
    // If this has been handled on update already due to SSR, try again.
    if (!this.lastSelectedOptionRecords.length) {
      this.initUserSelection();
    }

    // Case for when the DOM is streaming, there are no children, and a child
    // has [selected] set on it, we need to wait for DOM to render something.
    if (
      !this.lastSelectedOptionRecords.length &&
      !isServer &&
      !this.$options.length
    ) {
      setTimeout(() => {
        this.updateValueAndDisplayText();
      }, 0);
    }

    super.firstUpdated(changed);
  }

  protected override update(changed: PropertyValues<Select>) {
    if (!this.hasUpdated) {
      this.initUserSelection();
    }

    super.update(changed);
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
    if (this.disabled) return;

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

    if (this.open) this.$menu.handleKeyDown(event);
  }

  protected _handleMenuAction(event: MenuActionEvent) {
    if (this.selectItem(event.detail.item as Option)) {
      this.#dispatchChangeEvent();
      this.$field.focus();
      // For Narrator, activating an option moves focus the document then
    }
  }

  protected _handleMenuItemFocus(event: MenuItemFocusEvent) {
    this.$field.ariaActiveDescendantElement = event.detail.item;
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

  protected _handleSlotChange() {
    // When slots change, check for initially selected items if value is not set
    if (!this.value) {
      this.updateValueAndDisplayText();
    }
  }

  private selectItem(item: Option) {
    const selectedOptions = this.getSelectedOptions() ?? [];
    selectedOptions.forEach(([option]) => {
      if (item !== option) {
        option.selected = false;
      }
    });
    item.selected = true;

    return this.updateValueAndDisplayText();
  }

  private initUserSelection() {
    if (this.lastUserSetValue && !this.lastSelectedOptionRecords.length) {
      this.select(this.lastUserSetValue);
    } else if (
      this.lastUserSetSelectedIndex !== null &&
      !this.lastSelectedOptionRecords.length
    ) {
      this.selectIndex(this.lastUserSetSelectedIndex);
    } else {
      this.updateValueAndDisplayText();
    }
  }

  private updateValueAndDisplayText() {
    const selectedOptions = this.getSelectedOptions() ?? [];
    let changed = false;

    if (selectedOptions.length) {
      const [firstSelectedOption] = selectedOptions[0];
      changed = this.lastSelectedOption !== firstSelectedOption;
      this.lastSelectedOption = firstSelectedOption;
      this[VALUE] = firstSelectedOption.value;
      this.displayText = firstSelectedOption.displayText;
    } else {
      changed = this.lastSelectedOption !== null;
      this.lastSelectedOption = null;
      this[VALUE] = '';
      // Keep displayText if it was set (e.g., from SSR) and options aren't available yet.
      if (this.$options.length === 0 && this.displayText) {
        return changed;
      }
      this.displayText = '';
    }

    return changed;
  }

  private getSelectedOptions(): [Option, number][] | null {
    const items = this.$options;
    const records: [Option, number][] = [];
    items.forEach((item, index) => {
      if (item.selected) {
        records.push([item, index]);
      }
    });
    this.lastSelectedOptionRecords = records;
    return records.length ? records : null;
  }

  #dispatchChangeEvent = () => {
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true }));
  };

  #focusSelectedItemOrFirst() {
    const selectedOptions = this.getSelectedOptions();
    if (selectedOptions && selectedOptions.length > 0) {
      const [item] = selectedOptions[0];
      this.$menu.focusItem(item);
    } else {
      this.$menu.focusFirstItem();
    }
  }

  formResetCallback() {
    this.reset();
  }

  formStateRestoreCallback(state: string) {
    this.value = state;
  }

  select(value: string) {
    const item = this.$options.find((option) => option.value === value);
    if (item) {
      this.selectItem(item);
    }
  }

  selectIndex(index: number) {
    const item = this.$options[index];
    if (item) {
      this.selectItem(item);
    }
  }

  reset() {
    for (const option of this.$options) {
      option.selected = option.hasAttribute('selected');
    }
    this.updateValueAndDisplayText();
  }

  toggle() {
    if (this.disabled) return;
    this.open = !this.open;
  }
}
