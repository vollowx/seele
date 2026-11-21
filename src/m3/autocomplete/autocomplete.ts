import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Autocomplete } from '../../base/autocomplete.js';
import '../popup/popup.js';
import '../listbox/list-box.js';

import { autocompleteStyles } from './autocomplete-styles.css.js';

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
        <md-list-box
          part="listbox"
          id="listbox"
          tabindex="-1"
          bare
          @item-focus=${this.handleListItemFocus}
          @select=${this.handleMenuAction}
        >
          <slot @slotchange=${this.handleItemsSlotChange}></slot>
        </md-list-box>
      </md-popup>
    `;
  }
}
