import { isServer, LitElement } from 'lit';

import { InternalsAttached, internals } from './mixins/internals-attached.js';
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
    this.setAttribute('tabindex', '-1');
    this.setAttribute('base', 'menuitem');
    // if (!isServer) this.addEventListener('click', this.#handleDummy);
  }
}
