import { css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Tab } from '../../base/tab.js';

@customElement('md-tab')
export class M3Tab extends Tab {
  static override styles = [
    css`
      :host {
        display: inline-flex;
        cursor: pointer;
        padding: 8px 16px;
        outline: none;
        user-select: none;
        font: var(--md-sys-typography-label-large);
      }
      :host([selected]) {
        border-bottom: 2px solid var(--md-sys-color-primary);
        color: var(--md-sys-color-primary);
      }
      :host(:focus-visible) {
        outline: 2px solid red;
      }
    `
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tab': M3Tab;
  }
}
