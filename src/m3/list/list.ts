import { customElement, property } from 'lit/decorators.js';

import { ListBox } from '../../base/listbox.js';
import { listStyles } from './list-styles.css.js';

/**
 * @tag md-list
 *
 * TODO: Use listController
 */
@customElement('md-list')
export class M3List extends ListBox {
  // FIXME: Might cause a long list to scroll more than expected
  // override readonly _scrollPadding = 4;

  @property({ reflect: true }) color: 'standard' | 'segmented' = 'standard';

  static override styles = [listStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-list': M3List;
  }
}
