import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { M3Select } from './select.js';

import '../field/outlined-field.js';

import { selectStyles } from './select-styles.css.js';

/**
 * @tag md-outlined-select
 *
 * @slot - options
 */
@customElement('md-outlined-select')
export class M3OutlinedSelect extends M3Select {
  static override styles = [selectStyles];

  protected override renderField() {
    return html`
      <md-outlined-field
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
        ${this.renderFieldContent()} ${this.renderExpandIcon()}
      </md-outlined-field>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-outlined-select': M3OutlinedSelect;
  }
}
