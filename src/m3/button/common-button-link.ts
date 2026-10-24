import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Anchor } from '../../base/anchor.js';

import '../focus-ring/focus-ring.js';
import '../ripple/ripple.js';

import { targetStyles } from '../target-styles.css.js';
import { sharedButtonLinkStyles } from './shared-button-link-styles.css.js';
import { sharedButtonStyles } from './shared-button-styles.css.js';
import { commonButtonStyles } from './common-button-styles.css.js';

/**
 * @tag md-button-link
 *
 * @csspart anchor
 * @csspart label
 * @csspart icon
 *
 * @slot - label
 * @slot icon - leading icon
 */
@customElement('md-button-link')
export class M3ButtonLink extends Anchor {
  @property({ reflect: true })
  size: 'xs' | 's' | 'm' | 'l' | 'xl' = 's';
  @property({ reflect: true, type: Boolean })
  square = false;
  @property({ reflect: true })
  color: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @property({ reflect: true })
  variant: 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text' = 'filled';
  /**
   * Whether to show the icon at the end of the button.
   */
  @property({ type: Boolean, reflect: true, attribute: 'trailing-icon' })
  trailingIcon = false;

  static override styles = [
    ...super.styles,
    targetStyles,
    sharedButtonStyles,
    sharedButtonLinkStyles,
    commonButtonStyles,
  ];
  override render() {
    return this._renderAnchor(html`
      <md-focus-ring></md-focus-ring>
      <md-ripple></md-ripple>
      <span part="target"></span>
      <slot part="icon" name="icon" aria-hidden="true"></slot>
      <slot part="label"></slot>
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-button-link': M3ButtonLink;
  }
}
