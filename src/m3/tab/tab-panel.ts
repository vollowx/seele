import { css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { TabPanel } from '../../base/tab-panel.js';

@customElement('md-tab-panel')
export class M3TabPanel extends TabPanel {
  static override styles = [
    css`
      :host {
        display: block;
      }
      :host([hidden]) {
        display: none;
      }
    `
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tab-panel': M3TabPanel;
  }
}
