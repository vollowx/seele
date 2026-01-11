import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Input } from '../../base/input.js';

import '../field/filled-field.js';

import { textFieldStyles } from './text-field-styles.css.js';

@customElement('md-filled-text-field')
export class M3FilledTextField extends Input {
  @property({ reflect: true }) label = '';
  @property({ reflect: true }) supportingText = '';

  static override styles = [textFieldStyles];

  override render() {
    return html`
      <md-filled-field
        label=${this.label}
        supportingtext=${this.supportingText}
        ?populated=${!!this.value}
        ?disabled=${this.disabled}
        ?focused=${this.focused}
        ?error=${this.checkValidity() === false}
      >
        ${super.render()}
      </md-filled-field>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-filled-text-field': M3FilledTextField;
  }
}
