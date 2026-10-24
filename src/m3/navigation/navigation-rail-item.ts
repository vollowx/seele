import { html, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { internals } from '../../base/mixins/internals-attached.js';
import { Button } from '../../base/button.js';
import '../focus-ring/focus-ring.js';
import '../ripple/ripple.js';
import { type M3FocusRing } from '../focus-ring/focus-ring.js';
import { type M3Ripple } from '../ripple/ripple.js';

import { navigationRailItemStyles } from './navigation-rail-item-styles.css.js';

@customElement('md-nav-rail-item')
export class M3NavigationRailItem extends Button {
  @property() label = '';
  @property({ type: Boolean, reflect: true }) active = false;

  @query('md-focus-ring') $focusRing!: M3FocusRing | null;
  @query('md-ripple') $ripple!: M3Ripple | null;

  static override styles = [navigationRailItemStyles];
  override render() {
    return html`
      <div class="pill-root">
        <div class="pill">
          <md-focus-ring></md-focus-ring>
          <md-ripple></md-ripple>
        </div>
        <slot aria-hidden="true"></slot>
        <slot aria-hidden="true" name="active"></slot>
        <span class="label-inside">${this.label}</span>
      </div>
      <span class="label-outside">${this.label}</span>
    `;
  }

  override updated(changed: PropertyValues) {
    if (changed.has('label')) this[internals].ariaLabel = this.label;
    if (changed.has('active'))
      this[internals].ariaCurrent = this.active ? 'true' : null;
  }

  override firstUpdated() {
    this.$focusRing!.attach(this);
    this.$ripple!.attach(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-nav-rail-item': M3NavigationRailItem;
  }
}
