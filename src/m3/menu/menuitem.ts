import { customElement } from 'lit/decorators.js';

import { MenuItem } from '../../base/menuitem.js';
import { M3ListItemLookalike } from '../list/list-item.js';

/**
 * @tag md-menuitem
 *
 * @slot - contents in md-item
 */
@customElement('md-menuitem')
export class M3MenuItem extends M3ListItemLookalike(MenuItem) {
  override render() {
    return this.renderM3ListItem();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-menuitem': M3MenuItem;
  }
}
