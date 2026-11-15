import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import '../popup/popup.js';
import '../listbox/listbox.js';

import { Select } from '../../base/select.js';
import type { M3Field } from '../field/field.js';

export abstract class M3Select extends Select {
  @property({ type: String }) label = '';
  @property({ type: String, attribute: 'supporting-text' }) supportingText = '';

  @state() protected focused = false;

  @query('md-filled-field, md-outlined-field') protected field!: M3Field;

  protected override renderListbox() {
    return html`
      <md-popup
        part="popup"
        role="presentation"
        for="field"
        no-focus-control
        .open="${this.open}"
        @toggle=${(e: ToggleEvent) => (this.open = e.newState === 'open')}
      >
        <md-menu
          id="menu"
          part="menu"
          role="listbox"
          tabindex="-1"
          bare
          @item-focus="${this._handleMenuItemFocus}"
          @action="${this._handleMenuAction}"
        >
          <slot @slotchange=${this._handleSlotChange}></slot>
        </md-menu>
      </md-popup>
    `;
  }
}
