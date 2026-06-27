import { css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Tabs } from '../../base/tabs.js';

@customElement('md-tabs')
export class M3Tabs extends Tabs {
  static override styles = [
    css`
      :host {
        display: flex;
        flex-direction: row;
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
      }
    `
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tabs': M3Tabs;
  }
}
