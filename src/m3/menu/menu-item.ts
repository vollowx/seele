import { customElement } from 'lit/decorators.js';

import { M3ListItem } from '../list/list-item.js';
import { MenuItemMixin } from '../../base/menu-item.js';

/**
 * @tag md-menu-item
 *
 * @slot - contents in md-item
 */
@customElement('md-menu-item')
export class M3MenuItem extends MenuItemMixin(M3ListItem) {}

declare global {
  interface HTMLElementTagNameMap {
    'md-menu-item': M3MenuItem;
  }
}
