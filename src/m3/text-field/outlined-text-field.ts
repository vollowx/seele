import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Input } from '../../base/input.js';

import '../field/outlined-field.js';

import { textFieldStyles } from './text-field-styles.css.js';

@customElement('md-outlined-text-field')
export class M3OutlinedTextField extends Input {
  @property({ reflect: true }) label = '';
  @property({ reflect: true }) supportingText = '';

  static override styles = [textFieldStyles];

  override render() {
    return html`
      <md-outlined-field
        label=${this.label}
        supportingtext=${this.supportingText}
        ?populated=${!!this.value}
        ?disabled=${this.disabled}
        ?focused=${this.focused}
        ?error=${this.checkValidity() === false}
      >
        ${super.render()}
        <slot slot="start" name="start"></slot>
        <slot slot="end" name="end"></slot>
      </md-outlined-field>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-outlined-text-field': M3OutlinedTextField;
  }
}
