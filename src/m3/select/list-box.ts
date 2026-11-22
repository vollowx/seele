import { customElement } from 'lit/decorators.js';

import { ListBox } from '../../base/listbox.js';

import { listBoxStyles } from './list-box-styles.css.js';

/**
 * @tag md-list-box
 *
 * @slot - options
 */
@customElement('md-list-box')
export class M3ListBox extends ListBox {
  static override styles = [listBoxStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-list-box': M3ListBox;
  }
}
