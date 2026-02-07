import { customElement } from 'lit/decorators.js';

import { OptionMixin } from '../../base/option.js';
import { M3ListItem } from '../list/list-item.js';

/**
 * @tag md-option
 *
 * @slot - contents in md-menu-item
 */
@customElement('md-option')
export class M3Option extends OptionMixin(M3ListItem) {}

declare global {
  interface HTMLElementTagNameMap {
    'md-option': M3Option;
  }
}
