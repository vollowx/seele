import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { ListItem } from '../base/list-item.js';
import { M3Ripple } from './ripple.js';
import { M3FocusRing } from './focus-ring.js';

import { listItemStyles } from './list-item-styles.css.js';

/**
 * @tag md-list-item
 *
 * @slot - contents in md-item
 */
@customElement('md-list-item')
export class M3ListItem extends ListItem {
  constructor() {
    super();
    this.updateComplete.then(() => {
      this.ripple.$control = this;
      this.focusRing.$control = this;
    });
  }

  static override styles = [...super.styles, listItemStyles];

  protected override updated(changed: Map<string, any>) {
    super.updated(changed);
    if (changed.has('focused')) {
      if (this.focused) {
        this.focusRing.visualFocus();
      } else {
        this.focusRing.visualBlur();
      }
    }
  }

  @query('md-ripple') ripple!: M3Ripple;
  @query('md-focus-ring') focusRing!: M3FocusRing;

  override render() {
    return html`
      <md-item>
        <div slot="container">
          <md-focus-ring inward></md-focus-ring>
          <md-ripple></md-ripple>
        </div>
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
}

declare global {
  interface HTMLElementTagNameMap {
    'md-list-item': M3ListItem;
  }
}
