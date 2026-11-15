import { LitElement } from 'lit';

import {
  InternalsAttached,
  internals,
  updateInternals,
} from './mixins/internals-attached.js';
import { Disableable } from './mixins/disableable.js';

import { hiddenStyles } from './hidden-styles.css.js';

export class MenuItem extends Disableable(InternalsAttached(LitElement)) {
  get displayText(): string {
    return this.innerText.trim();
  }

  static override styles = [hiddenStyles];

  // Accessibility tools, particularly Narrator, only fires `click` event on
  // elements that have listeners for them.
  // #handleDummy() {}
  // TODO: test if it is still needed after items being directly focused
  constructor() {
    super();
    this[internals].role = 'menuitem';
    this[updateInternals]?.();
    // if (!isServer) this.addEventListener('click', this.#handleDummy);
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('seele-base')) {
      this.setAttribute('seele-base', 'menuitem');
    }
  }
}
