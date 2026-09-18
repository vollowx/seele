import { customElement, property } from 'lit/decorators.js';

import { ComposedMenu } from '../../base/composed-menu.js';
import './menu.js';

import { popupStyles } from '../popup/popup-styles.css.js';

/**
 * @tag md-composed-menu
 */
@customElement('md-composed-menu')
export class M3ComposedMenu extends ComposedMenu {
  @property({ type: Boolean, reflect: true }) vibrant = false;

  static override styles = [...super.styles, popupStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-composed-menu': M3ComposedMenu;
  }
}
