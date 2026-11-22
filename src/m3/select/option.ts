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
    return this.renderM3ListItem();
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
