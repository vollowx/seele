import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { Select } from '../../base/select.js';
import { M3Field } from '../field/field.js';

/**
 * @fires {Event} change - Fired when the selected value has changed.
 * @fires {Event} input - Fired when the selected value has changed.
 */
export abstract class M3Select extends Select {
  @property({ type: String }) label = '';
  @property({ type: String }) supportingText = '';

  @state() protected focused = false;

  @query('md-filled-field, md-outlined-field') protected field!: M3Field;

  protected override renderMenu() {
    return html`
      <md-menu
        part="menu"
        id="menu"
        for="field"
        type="listbox"
        data-tabindex="-1"
        ?quick="${this.quick}"
        offset="${this.offset}"
        align="${this.align}"
        align-strategy="${this.alignStrategy}"
        keep-open-blur
        no-focus-control
        ?open="${this.open}"
        @open="${() => (this.open = true)}"
        @close="${() => (this.open = false)}"
        @item-focus="${this.handleMenuItemFocus}"
        @select="${this.handleMenuSelect}"
      >
        <slot part="items" @slotchange=${this.handleSlotChange}></slot>
      </md-menu>
    `;
  }
}
