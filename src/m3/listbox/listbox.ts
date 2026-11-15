import { customElement } from 'lit/decorators.js';

import { ListBox } from '../../base/listbox.js';

import { listboxStyles } from './listbox-styles.css.js';

/**
 * @tag md-listbox
 *
 * @slot - options
 */
@customElement('md-listbox')
export class M3ListBox extends ListBox {
  static override styles = [listboxStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-listbox': M3ListBox;
  }
}
