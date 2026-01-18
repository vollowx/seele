import { customElement } from 'lit/decorators.js';

import { Menu } from '../base/menu.js';

import { menuPartStyles } from './menu-part-styles.css.js';
import { menuStyles } from './menu-styles.css.js';

/**
 * @tag md-menu
 *
 * @csspart menu-surface
 * @csspart list
 *
 * @slot - menu items
 */
@customElement('md-menu')
export class M3Menu extends Menu {
  override readonly _possibleItemTags = [
    'md-menu-item',
    'md-menu-item-checkbox',
    'md-menu-item-radio',
  ];
  override readonly _durations = { show: 300, hide: 200 };
  override readonly _scrollPadding = 4;

  static override styles = [menuPartStyles, menuStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-menu': M3Menu;
  }
}
