import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { Checkbox } from '../base/checkbox.js';

import './focus-ring.js';
import { M3Ripple } from './ripple.js';

import { checkboxStyles } from './checkbox-styles.css.js';
import { targetStyles } from './target-styles.css.js';

/**
 * @tag md-checkbox
 *
 * @csspart icon
 * @csspart mark
 * @csspart mark-short
 * @csspart mark-long
 */
@customElement('md-checkbox')
export class M3Checkbox extends Checkbox {
  static override styles = [...super.styles, targetStyles, checkboxStyles];
  override render() {
    return html`
      <md-focus-ring></md-focus-ring>
      <md-ripple enterbehavior="none"></md-ripple>
      <span part="target"></span>
      ${this.renderIcon()}
    `;
  }
  renderIcon() {
    return html`
      <svg part="icon" viewBox="0 0 18 18" aria-hidden="true">
        <rect part="mark mark-short"></rect>
        <rect part="mark mark-long"></rect>
      </svg>
    `;
  }
  @property({ type: Boolean, reflect: true }) error = false;
  @query('md-ripple') $ripple!: M3Ripple;

  override connectedCallback() {
    super.connectedCallback();
    // SSR'd <md-checkbox> components don't have their labels set up on time
    this.updateComplete.then(() => {
      this.$ripple.attach(this);
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-checkbox': M3Checkbox;
  }
}
