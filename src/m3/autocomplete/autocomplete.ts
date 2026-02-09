import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Autocomplete } from '../../base/autocomplete.js';

import { autocompleteStyles } from './autocomplete-styles.css.js';

/**
 * TODO: Make base Autocomplete
 * TODO: Check if manually dispatching input/change events on input is necessary
 */
@customElement('md-autocomplete')
export class M3Autocomplete extends Autocomplete {
  static override styles = [autocompleteStyles];

  override renderMenu() {
    return html`
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
}
