import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { M3Select } from './select.js';

import '../field/filled-field.js';

import { selectStyles } from './select-styles.css.js';

/**
 * @tag md-filled-select
 *
 * @slot - options
 */
@customElement('md-filled-select')
export class M3FilledSelect extends M3Select {
  static override styles = [selectStyles];

  protected override renderField() {
    return html`
      <md-filled-field
        id="field"
        part="field"
        .label=${this.label}
        .populated=${!!this.value}
        .disabled=${this.disabled}
        .required=${this.required}
        .error=${this.error}
        .focused=${this.open || this.focused}
        supporting-text=${this.supportingText}
        @keydown=${this._handleFieldKeydown}
        @focus=${() => (this.focused = true)}
        @blur=${() => (this.focused = false)}
        tabindex=${this.disabled ? '-1' : '0'}
        role="combobox"
        aria-haspopup="listbox"
        aria-controls="listbox"
        aria-disabled=${this.disabled}
        aria-required=${this.required}
      >
        ${this.renderFieldContent()}
      </md-filled-field>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-filled-select': M3FilledSelect;
  }
}
