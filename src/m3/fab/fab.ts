import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Button } from '../../base/button.js';

import '../focus-ring/focus-ring.js';
import '../ripple/ripple.js';

import { fabStyles } from './fab-styles.css.js';
import { targetStyles } from '../target-styles.css.js';

/**
 * @tag md-fab
 *
 * @csspart icon
 * @csspart label
 *
 * @slot - icon
 * @slot label - label
 */
@customElement('md-fab')
export class M3FAB extends Button {
  static override styles = [...super.styles, targetStyles, fabStyles];
  override render() {
    return html`
      <md-focus-ring></md-focus-ring>
      <md-ripple></md-ripple>
      <span part="target"></span>
      <slot part="icon" aria-hidden="true"></slot>
      <slot part="label" name="label"></slot>
    `;
  }
  @property({ reflect: true }) size: 'default' | 'medium' | 'large' = 'default';
  @property({ reflect: true }) color:
    | 'surface'
    | 'primary-container'
    | 'secondary-container'
    | 'tertiary-container'
    | 'primary'
    | 'secondary'
    | 'tertiary' = 'primary';
}

declare global {
  interface HTMLElementTagNameMap {
    'md-fab': M3FAB;
  }
}
