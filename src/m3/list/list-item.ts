import { html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { ListItem } from '../../base/listitem.js';

import '../item/item.js';
import '../ripple/ripple.js';
import '../focus-ring/focus-ring.js';
import type { M3Ripple } from '../ripple/ripple.js';
import type { M3FocusRing } from '../focus-ring/focus-ring.js';

import { listItemStyles } from './list-item-styles.css.js';

export declare class LookalikeInterface {
  $ripple: M3Ripple | null;
  $focusRing: M3FocusRing | null;
  renderM3ListItem(nonInteractive?: boolean): TemplateResult;
}

export const M3ListItemLookalike = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class Lookalike extends superClass {
    @query('md-ripple') $ripple!: M3Ripple | null;
    @query('md-focus-ring') $focusRing!: M3FocusRing | null;

    // @ts-ignore
    static override styles = [...super.styles, listItemStyles];
    renderM3ListItem(nonInteractive = false) {
      return html`
        <md-item>
          ${
            nonInteractive
              ? nothing
              : html`<div slot="container">
                  <md-focus-ring inward></md-focus-ring>
                  <md-ripple></md-ripple>
                </div>`
          }
          <slot slot="start" name="start"></slot>
          <slot slot="overline" name="overline"></slot>
          <slot></slot>
          <slot slot="headline" name="headline"></slot>
          <slot slot="supporting-text" name="supporting-text"></slot>
          <slot
            slot="trailing-supporting-text"
            name="trailing-supporting-text"
          ></slot>
          <slot slot="end" name="end"></slot>
        </md-item>
      `;
    }

    constructor(...args: any[]) {
      super(...args);
      this.updateComplete.then(() => {
        this.$ripple?.attach(this);
        this.$focusRing?.attach(this);
      });
    }
  }

  return Lookalike as Constructor<LookalikeInterface> & T;
};

/**
 * @tag md-list-item
 *
 * @slot - contents in md-item
 */
@customElement('md-list-item')
export class M3ListItem extends M3ListItemLookalike(ListItem) {
  override render() {
    return this.renderM3ListItem(true);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-list-item': M3ListItem;
  }
}
