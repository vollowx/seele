import { isServer } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { MenuItem } from '../../base/menuitem.js';
import { MenuList } from '../../base/menulist.js';
import { handleAnimationChange } from '../popup/popup-animation.js';
import './menu.js';

import { popupStyles } from '../popup/popup-styles.css.js';

/**
 * @tag md-composed-menu
 */
@customElement('md-menu-list')
export class M3MenuList extends MenuList {
  @property({ type: Boolean, reflect: true }) vibrant = false;

  static override styles = [...super.styles, popupStyles];

  constructor() {
    super();
    if (!isServer)
      handleAnimationChange(this, () => this.$control instanceof MenuItem);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-menu-list': M3MenuList;
  }
}
