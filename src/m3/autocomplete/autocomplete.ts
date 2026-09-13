import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Autocomplete } from '../../base/autocomplete.js';
import '../popup/popup.js';
import '../menu/menu.js';

import { autocompleteStyles } from './autocomplete-styles.css.js';

/**
 * TODO: Check if manually dispatching input/change events on input is necessary
 */
@customElement('md-autocomplete')
export class M3Autocomplete extends Autocomplete {
  static override styles = [autocompleteStyles];

  override renderMenu() {
    return html`
      <md-popup
        part="popup"
        role="presentation"
        no-focus-control
        quick
        .open=${this.open}
        @toggle=${(e: ToggleEvent) => (this.open = e.newState === 'open')}
      >
        <md-menu
          part="menu"
          id="menu"
          role="listbox"
          tabindex="-1"
          @action=${this.handleMenuAction}
        >
          <slot @slotchange=${this.handleItemsSlotChange}></slot>
        </md-menu>
      </md-popup>
    `;
  }
}
