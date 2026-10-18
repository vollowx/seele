import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Anchor } from '../../base/anchor.js';

import '../focus-ring/focus-ring.js';
import '../ripple/ripple.js';

import { targetStyles } from '../target-styles.css.js';
import { iconButtonStyles } from './icon-button-styles.css.js';
import { sharedButtonLinkStyles } from './shared-button-link-styles.css.js';
import { sharedButtonStyles } from './shared-button-styles.css.js';

/**
 * @tag md-icon-button-link
 *
 * @csspart anchor
 * @csspart icon
 *
 * @slot - icon
 */
@customElement('md-icon-button-link')
export class M3IconButtonLink extends Anchor {
  @property({ reflect: true })
  size: 'xs' | 's' | 'm' | 'l' | 'xl' = 's';
  @property({ reflect: true })
  color: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @property({ reflect: true })
  variant: 'text' | 'filled' | 'tonal' | 'outlined' = 'text';
  @property({ reflect: true })
  width: 'standard' | 'narrow' | 'wide' = 'standard';

  static override styles = [
    ...super.styles,
    targetStyles,
    sharedButtonStyles,
    sharedButtonLinkStyles,
    iconButtonStyles,
  ];
  override render() {
    return this._renderAnchor(html`
      <md-focus-ring></md-focus-ring>
      <md-ripple></md-ripple>
      <span part="target"></span>
      <slot part="icon"></slot>
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-icon-button-link': M3IconButtonLink;
  }
}
