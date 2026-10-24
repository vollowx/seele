import { html, PropertyValues } from 'lit';
import { query } from 'lit/decorators.js';
import { customElement } from '../../core/decorators.js';
import { internals } from '../../base/mixins/internals-attached.js';
import { Radio } from '../../base/radio.js';
import '../focus-ring/focus-ring.js';
import '../ripple/ripple.js';
import type { M3Ripple } from '../ripple/ripple.js';

import { targetStyles } from '../target-styles.css.js';
import { radioStyles } from './radio-styles.css.js';

/**
 * @tag md-radio
 */
@customElement('md-radio')
export class M3Radio extends Radio {
  @query('md-ripple') $ripple!: M3Ripple | null;

  static override styles = [targetStyles, radioStyles];
  override render() {
    return html`
      <md-focus-ring></md-focus-ring>
      <md-ripple enter-behavior="none"></md-ripple>
      <span part="target"></span>
      <svg class="icon" viewBox="0 0 20 20" aria-hidden="true">
        <circle class="ring" cx="10" cy="10" r="9" />
        <circle class="dot" cx="10" cy="10" r="0" />
      </svg>
    `;
  }

  override firstUpdated() {
    // SSR'd <md-radio> components don't have their labels set up on time
    this.$ripple!.attach(this, true);
  }
  override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if (changedProperties.has('checked')) {
      const oldValue = changedProperties.get('checked');
      if (oldValue === undefined) return;

      this[internals].states.delete('checking');
      this[internals].states.delete('unchecking');
      this[internals].states.add(this.checked ? 'checking' : 'unchecking');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-radio': M3Radio;
  }
}
