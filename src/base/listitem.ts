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

  @property({ type: Boolean, reflect: true }) selected = false;
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
    if (
      changed.has('disabled') ||
      changed.has('focused') ||
      changed.has('selected')
    ) {
      this[updateInternals]();
    }
  }

  override [updateInternals](): void {
    super[updateInternals]();
    this[internals].ariaSelected = this.selected ? 'true' : 'false';
    this.selected
      ? this[internals].states.add('selected')
      : this[internals].states.delete('selected');
    this.focused && focusVisible
      ? this[internals].states.add('focus-visible')
      : this[internals].states.delete('focus-visible');
  }

  // Activedescendant items are never focusable — the list host owns focus, so
  // `Disableable`'s tabindex management must not make them tabbable.
  override _syncTabIndex(): void {}

  override focus(): void {
    this.focused = true;
  }

  override blur(): void {
    this.focused = false;
  }
}
