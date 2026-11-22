import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { MenuItem } from '../../base/menuitem.js';
import { M3ListItemLookalike } from '../list/list-item.js';
import { menuItemStyles } from './menu-item-styles.css.js';

/**
 * @tag md-menu-item
 *
 * @slot - contents in md-item
 * @slot submenu - nested `md-menu-list` fly-out submenu
 */
@customElement('md-menu-item')
export class M3MenuItem extends M3ListItemLookalike(MenuItem) {
  static override styles = [...super.styles, menuItemStyles];

  override render() {
    return html`${this.renderM3ListItem()}<slot name="submenu"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-menu-item': M3MenuItem;
  }
}
