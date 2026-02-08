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
import { FormAssociated } from '../../base/mixins/form-associated.js';

import { autocompleteStyles } from './autocomplete-styles.css.js';
import { Input } from '../../base/input.js';

const Base = FormAssociated(FocusDelegated(InternalsAttached(LitElement)));

@customElement('md-autocomplete')
export class M3Autocomplete extends Base {
  static override styles = [autocompleteStyles];

  @property({ type: Boolean, reflect: true }) open = false;
  @property() value = '';

  @property({ type: Number }) offset = 0;
  @property({ reflect: true }) align: Placement = 'bottom-start';
  @property({ type: String, reflect: true, attribute: 'align-strategy' })
  alignStrategy: Strategy = 'absolute';

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

    // Set up ARIA and event listeners on the slotted input
    input.autocomplete = 'both'; // TODO: both/list configurable
    input.$inputOrTextarea.role = 'combobox';
    input.$inputOrTextarea.ariaExpanded = String(this.open);
    input.$inputOrTextarea.ariaHasPopup = 'listbox';
    input.$inputOrTextarea.ariaControlsElements = [this.$menu];

    input.addEventListener('input', this.handleInput.bind(this));
    input.addEventListener('keydown', this.handleKeydown.bind(this));
    input.addEventListener('click', () => (this.open = !this.open));
    // input.addEventListener('focus', () => (this.open = true));

    this.$menu.attach(input);
  }

  private handleItemsSlotChange() {
    this.filterOptions();
  }

  private handleInput(event: Event) {
    const target = event.target as any;
    this.value = target.value;
    this.open = true;
    this.filterOptions();

    this.dispatchEvent(
      new CustomEvent('input', { bubbles: true, composed: true })
    );
  }

  private handleKeydown(event: KeyboardEvent) {
    if (this.disabled) return;

    // Forward navigation keys to the Menu's internal key handling
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
      if (!this.open && event.key === 'ArrowDown') {
        this.open = true;
        return;
      }

      const eventClone = new KeyboardEvent(event.type, event);
      this.$menu.$menu.dispatchEvent(eventClone);
    }
  }

  private handleMenuSelect(event: MenuSelectEvent) {
    const selectedItem = event.detail.item;
    const newValue =
      selectedItem.getAttribute('value') ||
      selectedItem.textContent?.trim() ||
      '';

    this.value = newValue;
    if (this.$input) {
      this.$input.value = newValue;
    }

    this.open = false;
    this.dispatchEvent(new Event('change', { bubbles: true }));
    this.filterOptions();
  }

  private filterOptions() {
    const searchTerm = this.value.toLowerCase();

    this.itemSlotElements.forEach((item) => {
      const text = (item.textContent || '').toLowerCase();
      const isMatch = text.includes(searchTerm);

      item.hidden = !isMatch;
    });
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has('open') && this.$input) {
      this.$input.$inputOrTextarea.ariaExpanded = String(this.open);
    }
  }
}
