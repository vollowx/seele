import { LitElement, html, PropertyValues } from 'lit';
import {
  customElement,
  property,
  query,
  queryAssignedElements,
} from 'lit/decorators.js';

import type { Placement, Strategy } from '@floating-ui/dom';
import type { Menu, MenuSelectEvent } from '../../base/menu.js';

import { InternalsAttached } from '../../base/mixins/internals-attached.js';
import { FocusDelegated } from '../../base/mixins/focus-delegated.js';

import { autocompleteStyles } from './autocomplete-styles.css.js';
import { Input } from '../../base/input.js';

const Base = FocusDelegated(InternalsAttached(LitElement));

type AutocompleteMode = 'none' | 'list' | 'both';

/**
 * TODO: Make base Autocomplete
 * TODO: Check if manually dispatching input/change events on input is necessary
 */
@customElement('md-autocomplete')
export class M3Autocomplete extends Base {
  static override styles = [autocompleteStyles];

  @property({ type: Boolean, reflect: true }) open = false;

  @property({ type: Number }) offset = 0;
  @property({ reflect: true }) align: Placement = 'bottom-start';
  @property({ type: String, reflect: true, attribute: 'align-strategy' })
  alignStrategy: Strategy = 'absolute';

  @property() mode: AutocompleteMode = 'none';

  @query('[part="menu"]') $menu!: Menu;
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

      <md-menu
        part="menu"
        id="menu"
        type="listbox"
        data-tabindex="-1"
        .offset=${this.offset}
        .align=${this.align}
        .alignStrategy=${this.alignStrategy}
        no-focus-control
        ?open=${this.open}
        @open="${() => (this.open = true)}"
        @close="${() => (this.open = false)}"
        @select=${this.handleMenuSelect}
      >
        <slot @slotchange=${this.handleItemsSlotChange}></slot>
      </md-menu>
    `;
  }

  private handleInputSlotChange() {
    const input = this.$input;
    if (!input) return;

    const $realInput = this.$input.$inputOrTextarea;
    if ($realInput) {
      $realInput.role = 'combobox';
      $realInput.ariaExpanded = String(this.open);
      $realInput.ariaHasPopup = 'listbox';
      $realInput.ariaAutoComplete = this.mode;
      $realInput.ariaControlsElements = [this.$menu];

      input.addEventListener('input', this.handleInput.bind(this));
      input.addEventListener('keydown', this.handleInputKeydown.bind(this));
      input.addEventListener('click', () => (this.open = !this.open));

      this.$menu.attach($realInput);
    }
  }

  private handleItemsSlotChange() {
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
      const eventClone = new KeyboardEvent(event.type, event);
      eventClone.preventDefault = () => event.preventDefault();
      eventClone.stopPropagation = () => event.stopPropagation();
      this.$menu.$menu.dispatchEvent(eventClone);

      if (event.key === 'Enter') this.open = false;
    }
  }

  private handleMenuSelect(event: MenuSelectEvent) {
    const selectedItem = event.detail.item;
    const newValue =
      selectedItem.getAttribute('value') ||
      selectedItem.textContent?.trim() ||
      '';

    if (this.$input) {
      this.$input.value = newValue;
    }

    this.open = false;
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
