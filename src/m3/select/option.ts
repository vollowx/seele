import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Option } from '../../base/option.js';
import { M3ListItemLookalike } from '../list/list-item.js';

/**
 * @tag md-option
 *
 * @slot - contents in md-menu-item
 */
@customElement('md-option')
export class M3Option extends M3ListItemLookalike(Option) {
  override render() {
    return this.renderM3ListItem({
      start: html`
        <span class="checkmark-container" aria-hidden="true">
          <svg class="checkmark" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              fill="currentColor"
              d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"
            />
          </svg>
        </span>
      `,
    });
  }

  protected override updated(changed: Map<string, any>) {
    super.updated(changed);
    if (changed.has('focused')) {
      if (this.focused) {
        this.$focusRing?.visualFocus();
      } else {
        this.$focusRing?.visualBlur();
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-option': M3Option;
  }
}
