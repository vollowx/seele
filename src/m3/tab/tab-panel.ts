import { customElement } from 'lit/decorators.js';
import { TabPanel } from '../../base/tab-panel.js';
import { tabPanelStyles } from './tab-panel-styles.css.js';

@customElement('md-tab-panel')
export class M3TabPanel extends TabPanel {
  static override styles = [tabPanelStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tab-panel': M3TabPanel;
  }
}
