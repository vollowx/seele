import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { Tabs } from '../../base/tabs.js';
import type { M3Tab } from './tab.js';

import { tabsStyles } from './tabs-styles.css.js';

/**
 * TODO: vertical tabs, tablist placement
 */
@customElement('md-tabs')
export class M3Tabs extends Tabs {
  @query('[part="indicator"]') $indicator: HTMLElement;
  @property({ type: Boolean, reflect: true }) secondary = false;
  @property({ type: Boolean, reflect: true }) iconsAbove = false;

  static override styles = [tabsStyles];
  override render() {
    return html`
      ${super.render()}
      <div part="indicator" role="presentation"></div>
    `;
  }

  override selectTab(selectedTab: M3Tab) {
    super.selectTab(selectedTab);
    requestAnimationFrame(() => {
      const left =
        selectedTab.offsetLeft +
        (this.secondary ? 0 : selectedTab.$content.offsetLeft);
      const width = this.secondary
        ? selectedTab.offsetWidth
        : selectedTab.$content.offsetWidth;
      this.$indicator.style.left = `${left}px`;
      this.$indicator.style.width = `${width}px`;
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tabs': M3Tabs;
  }
}
