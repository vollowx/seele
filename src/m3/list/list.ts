import { customElement, property } from 'lit/decorators.js';

import { List } from '../../base/list.js';
import { listStyles } from './list-styles.css.js';

/**
 * @tag md-list
 */
@customElement('md-list')
export class M3List extends List {
  @property({ reflect: true }) color: 'standard' | 'segmented' = 'standard';

  static override styles = [listStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-list': M3List;
  }
}
