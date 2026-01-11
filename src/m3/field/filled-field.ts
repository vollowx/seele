import { customElement } from 'lit/decorators.js';
import { M3Field } from './field.js';
import { fieldStyles } from './field-styles.css.js';
import { filledFieldStyles } from './filled-field-styles.css.js';

@customElement('md-filled-field')
export class M3FilledField extends M3Field {
  static override styles = [fieldStyles, filledFieldStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-filled-field': M3FilledField;
  }
}
