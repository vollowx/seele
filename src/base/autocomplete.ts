import { LitElement, html, PropertyValues, isServer } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';

import { ensureReady, ensureSlottedReady } from '../core/ensure-ready.js';
import { InternalsAttached } from './mixins/internals-attached.js';
import { FocusDelegated } from './mixins/focus-delegated.js';

import type { Input } from './input.js';
import type { Popup } from './popup.js';
import type { MenuActionEvent } from './menu.js';
import type {
  ListBox,
  ListItemFocusEvent,
  ListboxSelectEvent,
} from './listbox.js';

const Base = FocusDelegated(InternalsAttached(LitElement));

export type AutocompleteMode = 'none' | 'list' | 'both';

export class Autocomplete extends Base {
  @property({ type: Boolean }) open = false;
  @property() mode: AutocompleteMode = 'none';

  @query('[part=popup]') $popup!: Popup;
  @query('[part~=listbox]') $listbox!: ListBox;
  @queryAssignedElements({ slot: 'input', flatten: true })
  $slottedInput!: HTMLElement[];
  @queryAssignedElements({ flatten: true })
  $slottedItems!: HTMLElement[];

  get $input(): Input | undefined {
    return this.$slottedInput[0] as Input | undefined;
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

  override connectedCallback() {
    super.connectedCallback();
    void this.handleInputSlotChange();
  }

  override disconnectedCallback() {
    this.#inputVersion++;
    this.#unbindInput();
    super.disconnectedCallback();
  }

  #boundInput: Input | null = null;
  #inputVersion = 0;
  #awaitingMatch = false;
  #inputListener = this.handleInput.bind(this);
  #keydownListener = this.handleInputKeydown.bind(this);

  #unbindInput() {
    if (!this.#boundInput) return;
    this.#boundInput.removeEventListener('input', this.#inputListener);
    this.#boundInput.removeEventListener('keydown', this.#keydownListener);
    this.$popup.hide();
    this.open = false;
    this.$popup.detach();
    this.$popup.$ariaControl = null;
    this.#boundInput = null;
    this.#awaitingMatch = false;
  }

  private async handleInputSlotChange() {
    const version = ++this.#inputVersion;
    if (this.#boundInput && this.#boundInput !== this.$input) {
      this.#unbindInput();
    }

    await ensureReady(this);
    if (!this.isConnected || version !== this.#inputVersion) return;
    const input = this.$input;
    if (!input || input === this.#boundInput) return;

    await ensureSlottedReady(this, () => [input, this.$popup, this.$listbox]);
    if (
      !this.isConnected ||
      version !== this.#inputVersion ||
      input !== this.$input
    )
      return;

    const $realInput = input.$inputOrTextarea;

    $realInput.role = 'combobox';
    $realInput.ariaHasPopup = 'listbox';
    $realInput.ariaAutoComplete = this.mode;
    $realInput.ariaControlsElements = [this.$listbox];

    input.addEventListener('input', this.#inputListener);
    input.addEventListener('keydown', this.#keydownListener);

    this.$popup.$ariaControl = $realInput;
    this.$popup.attach(input);
    this.#boundInput = input;
    this.handleItemsSlotChange();
    $realInput.ariaExpanded = String(this.open);
  }

  protected handleItemsSlotChange() {
    if (this.#boundInput) this.filterOptions(this.#boundInput.value);
    for (const item of this.$slottedItems) {
      void this.#handleItemReady(item);
    }
  }

  async #handleItemReady(item: HTMLElement) {
    await ensureReady(item);
    if (!this.isConnected || !this.$slottedItems.includes(item)) return;
    if (!this.#boundInput || !this.#awaitingMatch || !this.open) return;
    const inputEl = this.#boundInput.$inputOrTextarea;
    const firstMatch = this.#firstMatch(inputEl.value);
    if (firstMatch) {
      this.#awaitingMatch = false;
      this.$listbox.focusItem(firstMatch);
    }
  }

  #firstMatch(value: string) {
    if (!value) return undefined;
    return this.$listbox.$items.find((item) =>
      item.textContent?.trim().toLowerCase().startsWith(value.toLowerCase())
    );
  }

  private handleInput(event: InputEvent) {
    const inputEl = this.#boundInput!.$inputOrTextarea as HTMLInputElement;
    const currentValue = inputEl.value;

    this.open = true;

    // Filter items based on current value
    this.filterOptions(currentValue);
    const firstMatch = this.#firstMatch(currentValue);
    this.#awaitingMatch = !!currentValue && !firstMatch;
    this.$listbox.clearFocus();
    if (firstMatch) this.$listbox.focusItem(firstMatch);
    else inputEl.ariaActiveDescendantElement = null;

    // Inline completion logic (mode = both)
    if (this.mode === 'both' && !event.inputType?.startsWith('delete')) {
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
      this.#boundInput!.value = suggestion;
      inputEl.value = suggestion;
      inputEl.setSelectionRange(typedValue.length, suggestion.length);
    }
  }

  private filterOptions(searchTerm: string) {
    if (this.mode === 'none') return;

    const normalizedSearch = searchTerm.toLowerCase();

    this.$slottedItems.forEach((item) => {
      const text = (item.textContent || '').toLowerCase().trim();
      const isMatch = text.startsWith(normalizedSearch);

      item.hidden = !isMatch;
    });
  }

  private handleInputKeydown(event: KeyboardEvent) {
    if (this.#boundInput?.disabled) return;

    if (['Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      this.#awaitingMatch = false;
      if (!this.open && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        this.open = true;
        return;
      }
      if (this.open) {
        this.$listbox.handleKeyDown(event);
      }
    }
  }

  protected handleListItemFocus(event: ListItemFocusEvent) {
    const input = this.#boundInput?.$inputOrTextarea;
    if (input) input.ariaActiveDescendantElement = event.detail.item;
  }

  protected async handleMenuAction(
    event: MenuActionEvent | ListboxSelectEvent
  ) {
    const selectedItem = event.detail.item;
    const newValue =
      selectedItem.getAttribute('value') ||
      selectedItem.textContent?.trim() ||
      '';

    const input = this.#boundInput;
    if (input) {
      input.value = newValue;
      await input.updateComplete;
      if (this.#boundInput !== input) return;
      input.$inputOrTextarea.focus({ preventScroll: true });
      input.select();
    }
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has('open') && this.#boundInput) {
      const $input = this.#boundInput.$inputOrTextarea;
      if ($input) {
        $input.ariaExpanded = String(this.open);
        if (!this.open) {
          this.#awaitingMatch = false;
          $input.ariaActiveDescendantElement = null;
        }
      }
    }
  }
}
