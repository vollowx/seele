import { LitElement, html, PropertyValues, isServer } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';

import { ensureSlottedReady } from '../core/ensure-ready.js';
import { InternalsAttached } from './mixins/internals-attached.js';
import { FocusDelegated } from './mixins/focus-delegated.js';

import type { Input } from './input.js';
import type { Popup } from './popup.js';
import type { Menu, MenuActionEvent } from './menu.js';

const Base = FocusDelegated(InternalsAttached(LitElement));

export type AutocompleteMode = 'none' | 'list' | 'both';

/**
 * TODO: Check if manually dispatching input/change events on input is necessary
 */
export class Autocomplete extends Base {
  @property({ type: Boolean }) open = false;
  @property() mode: AutocompleteMode = 'none';

  @query('[part=popup]') $popup!: Popup;
  @query('[part=menu]') $menu!: Menu;
  @queryAssignedElements({ slot: 'input', flatten: true })
  inputSlotElements!: HTMLElement[];
  @queryAssignedElements({ flatten: true })
  itemSlotElements!: HTMLElement[];

  private get $input() {
    return this.inputSlotElements[0] as Input;
  }

  override render() {
    return html`
      <slot name="input" @slotchange=${this.handleInputSlotChange}></slot>
      ${this.renderMenu()}
    `;
  }

  /**
   * Check example content from the m3 implementation
   */
  renderMenu() {
    return html``;
  }

  constructor() {
    super();
    if (!isServer) {
      this.addEventListener('focusout', this.#handleFocusOut.bind(this));
    }
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

  override async firstUpdated() {
    await this.handleInputSlotChange();
  }

  /**
   * To prevent multiple calls.
   */
  #inputBound = false;
  private async handleInputSlotChange() {
    if (this.#inputBound) return;

    await ensureSlottedReady(this, () => this.inputSlotElements);

    const input = this.$input;
    const $realInput = input?.$inputOrTextarea;

    $realInput.role = 'combobox';
    $realInput.ariaHasPopup = 'listbox';
    $realInput.ariaAutoComplete = this.mode;
    $realInput.ariaControlsElements = [this.$menu];

    input.addEventListener('input', this.handleInput.bind(this));
    input.addEventListener('keydown', this.handleInputKeydown.bind(this));

    this.$popup.$ariaControl = $realInput;
    this.$popup.attach(input);

    this.#inputBound = true;
  }

  protected async handleItemsSlotChange() {
    // Initial filter based on current input value (if any)
    this.filterOptions(this.$input?.value || '');
  }

  private handleInput(event: InputEvent) {
    const inputEl = this.$input.$inputOrTextarea as HTMLInputElement;
    const currentValue = inputEl.value;

    this.open = true;

    // Filter items based on current value
    const firstMatch = this.filterOptions(currentValue);

    // Inline completion logic (mode = both)
    if (this.mode === 'both' && event.inputType !== 'deleteContentBackward') {
      if (firstMatch && currentValue.length > 0) {
        this.applyInlineAutoComplete(inputEl, firstMatch, currentValue);
      }
    }
  }

  private applyInlineAutoComplete(
    inputEl: HTMLInputElement,
    item: HTMLElement,
    typedValue: string
  ) {
    const suggestion = item.textContent?.trim() || '';

    if (suggestion.toLowerCase().startsWith(typedValue.toLowerCase())) {
      inputEl.value = suggestion;
      inputEl.setSelectionRange(typedValue.length, suggestion.length);
    }
  }

  private filterOptions(searchTerm: string): HTMLElement | null {
    if (this.mode === 'none') return null;

    const normalizedSearch = searchTerm.toLowerCase();
    let firstMatch: HTMLElement | null = null;

    this.itemSlotElements.forEach((item) => {
      const text = (item.textContent || '').toLowerCase().trim();
      const isMatch = text.startsWith(normalizedSearch);

      item.hidden = !isMatch;
      if (isMatch && !firstMatch) {
        firstMatch = item;
      }
    });

    return firstMatch;
  }

  private handleInputKeydown(event: KeyboardEvent) {
    if (this.$input?.disabled) return;

    if (['Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      if (!this.open && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        this.open = true;
        return;
      }
      if (this.open) {
        this.$menu.handleKeyDown(event);
      }
    }
  }

  protected handleMenuAction(event: MenuActionEvent) {
    const selectedItem = event.detail.item;
    const newValue =
      selectedItem.getAttribute('value') ||
      selectedItem.textContent?.trim() ||
      '';

    if (this.$input) {
      this.$input.value = newValue;
    }
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has('open') && this.$input) {
      const $input = this.$input.$inputOrTextarea;
      if ($input) {
        $input.ariaExpanded = String(this.open);
      }
    }
  }
}
