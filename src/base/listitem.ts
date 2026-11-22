import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { focusVisible } from '../core/focus.js';
import {
  InternalsAttached,
  internals,
  updateInternals,
} from './mixins/internals-attached.js';
import { FormAssociated } from './mixins/form-associated.js';

import { hiddenStyles } from './hidden-styles.css.js';

export class ListItem extends FormAssociated(InternalsAttached(LitElement)) {
  _role: string = 'listitem';

  static override styles = [hiddenStyles];

  @property({ type: Boolean, reflect: true }) focused = false;

  get displayText(): string {
    return this.innerText.trim();
  }

  constructor() {
    super();
    this[updateInternals]();
  }

  override connectedCallback() {
    super.connectedCallback();
    this[internals].role = this._role;
    if (!this.hasAttribute('seele-base')) {
      this.setAttribute('seele-base', this._role);
    }
    this[updateInternals]();
  }

  protected override updated(changed: Map<string, any>) {
    super.updated(changed);
    if (changed.has('disabled') || changed.has('focused')) {
      this[updateInternals]();
    }
  }

  override [updateInternals](): void {
    super[updateInternals]();
    this.focused && focusVisible
      ? this[internals].states.add('focus-visible')
      : this[internals].states.delete('focus-visible');
  }

  // Prevent `Disableable` mixin from making this tabbable.
  override _syncTabIndex(): void {}

  override focus(): void {
    this.focused = true;
  }

  override blur(): void {
    this.focused = false;
  }
}
