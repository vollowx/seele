import { isServer, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import {
  InternalsAttached,
  internals,
  replaceStates,
  updateInternals,
} from './mixins/internals-attached.js';
import { Disableable } from './mixins/disableable.js';

import { hiddenStyles } from './hidden-styles.css.js';

export class MenuItem extends Disableable(InternalsAttached(LitElement)) {
  _role = 'menuitem';

  @property({ type: Boolean, reflect: true }) focused = false;

  get displayText(): string {
    return this.innerText.trim();
  }

  static override styles = [hiddenStyles];

  // Accessibility tools, particularly Narrator, only fires `click` event on
  // elements that have listeners for them.
  #handleDummy() {}
  constructor() {
    super();
    this[internals].role = 'menuitem';
    this.setAttribute('tabindex', '-1');
    this[updateInternals]();
    if (!isServer) this.addEventListener('click', this.#handleDummy);
  }

  protected override willUpdate(changed: Map<string, any>) {
    super.willUpdate(changed);
    if (changed.has('focused')) {
      this[updateInternals]();
    }
  }

  override [updateInternals]() {
    super[updateInternals]?.();
    this[replaceStates](['focused'], [this.focused ? 'focused' : null]);
  }

  override focus(): void {
    this.focused = true;
  }
  override blur(): void {
    this.focused = false;
  }
}
