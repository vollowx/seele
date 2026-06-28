import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { Tab } from '../../base/tab.js';
import '../focus-ring/focus-ring.js';
import '../ripple/ripple.js';

import { targetStyles } from '../target-styles.css.js';
import { tabStyles } from './tab-styles.css.js';

@customElement('md-tab')
export class M3Tab extends Tab {
  static override styles = [targetStyles, tabStyles];
  override render() {
    return html`
      <md-focus-ring inward></md-focus-ring>
      <md-ripple inward></md-ripple>
      <span part="target"></span>
      <div part="content">
        <slot part="icon" name="icon" aria-hidden="true"></slot>
        <slot part="label"></slot>
      </div>
    `;
  }
  @query('[part="content"]') $content: HTMLDivElement;
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tab': M3Tab;
  }
}
