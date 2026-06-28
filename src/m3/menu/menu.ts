import { customElement } from 'lit/decorators.js';
import { property } from 'lit/decorators.js';

import { Menu } from '../../base/menu.js';
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
  override readonly _durations = { show: 300, hide: 150 };
  // FIXME: Might cause a long list to scroll more than expected
  // override readonly _scrollPadding = 4;

  @property({ reflect: true }) color: 'standard' | 'vibrant' = 'standard';

  static override styles = [menuStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-menu': M3Menu;
  }
}
