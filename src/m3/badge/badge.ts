import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { badgeStyles } from './badge-styles.css.js';

// TODO: integrate with md-tab
@customElement('md-badge')
export class M3Badge extends LitElement {
  @property({ type: Number }) value!: number;
  @property({ type: Number }) max!: number;
  @property({ type: Boolean, reflect: true, attribute: 'show-zero' }) showZero = false;
  @property({ type: Boolean, reflect: true }) small = false;
  @property({ type: Boolean, reflect: true }) left = false;
  @property({ type: Boolean, reflect: true }) bottom = false;
  @query('[part~="badge"]') $badge!: HTMLSpanElement | null;

  static override styles = [badgeStyles];
  override render() {
    return html`
      <div part="root">
        <slot></slot>
        <span part="badge">${this.#getDisplayValue()}</span>
      </div>
    `;
  }

  #getDisplayValue() {
    const value = this.value;
    const max = this.max;
    if (max !== 0 && value > max) {
      return `${max}+`;
    }
    return value;
  }
}
