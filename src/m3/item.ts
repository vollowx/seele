import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Item } from '../base/item.js';

import { itemStyles } from './item-styles.css.js';

/**
 * @tag md-item
 *
 * @csspart container
 * @csspart start
 * @csspart text
 * @csspart overline
 * @csspart headline
 * @csspart supporting-text
 * @csspart trailing-supporting-text
 * @csspart end
 *
 * @slot container - container element
 * @slot start - start content
 * @slot overline - overline text
 * @slot headline - headline text
 * @slot supporting-text - supporting text
 * @slot trailing-supporting-text - trailing supporting text
 * @slot end - end content
 */
@customElement('md-item')
export class M3Item extends Item {
  static override styles = [itemStyles];

  override render() {
    return html`
      <slot name="container"></slot>
      <slot name="start"></slot>
      <div class="text">
        <slot name="overline"></slot>
        <slot class="default-slot"></slot>
        <slot name="headline"></slot>
        <slot name="supporting-text"></slot>
      </div>
      <slot name="trailing-supporting-text"></slot>
      <slot name="end"></slot>
    `;
  }

  @property({ type: Boolean, reflect: true }) multiline = false;
}

declare global {
  interface HTMLElementTagNameMap {
    'md-item': M3Item;
  }
}
