import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import '../popup/popup.js';
import './list-box.js';

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
        <md-list-box
          id="listbox"
          part="listbox"
          tabindex="-1"
          bare
          .multiple=${this.multiple}
          .disabled=${this._disabled}
          @item-focus="${this._handleListItemFocus}"
          @select="${this._handleListboxSelect}"
        >
          <slot @slotchange=${this._handleSlotChange}></slot>
        </md-list-box>
      </md-popup>
    `;
  }

  protected renderExpandIcon() {
    return html`
      <svg
        slot="end"
        part="expand-icon"
        class="${this.open ? ' open' : ''}"
        height="5"
        viewBox="7 10 10 5"
        aria-hidden="true"
      >
        <polygon
          fill="currentColor"
          stroke="none"
          fill-rule="evenodd"
          points="7 10 12 15 17 10"
        ></polygon>
      </svg>
    `;
  }
}
