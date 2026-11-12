import { customElement, property } from 'lit/decorators.js';

import { MenuList } from '../../base/menulist.js';
import './menu.js';

import { popupStyles } from '../popup/popup-styles.css.js';

/**
 * @tag md-composed-menu
 */
@customElement('md-menulist')
export class M3MenuList extends MenuList {
  @property({ type: Boolean, reflect: true }) vibrant = false;

  static override styles = [...super.styles, popupStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-menulist': M3MenuList;
  }
}
