import { isServer } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { Popup } from '../../base/popup.js';
import { handleAnimationChange } from './popup-animation.js';
import { popupStyles } from './popup-styles.css.js';

@customElement('md-popup')
export class M3Popup extends Popup {
  @property({ type: Boolean, reflect: true }) quick = false;
  @property({ type: Boolean, reflect: true }) vibrant = false;

  static override styles = [...super.styles, popupStyles];

  constructor() {
    super();
    if (!isServer) handleAnimationChange(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-popup': M3Popup;
  }
}
