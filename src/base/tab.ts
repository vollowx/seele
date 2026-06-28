import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { InternalsAttached, internals } from './mixins/internals-attached.js';
import { genUniqueId } from '../core/unique-id.js';

/**
 * TODO: disabled
 */
export class Tab extends InternalsAttached(LitElement) {
  protected _role: string = 'tab';

  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) focused = false;
  @property({ type: String, reflect: true }) value = '';

  override render() {
    return html`<slot></slot>`;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('seele-base', 'tab');
    this[internals].role = this._role;
    if (!this.id) this.id = genUniqueId('tab');
    this.#updateInternals();
  }

  protected override updated(changed: Map<string, any>) {
    super.updated(changed);
    if (changed.has('selected') || changed.has('focused')) {
      this.#updateInternals();
    }
  }

  #updateInternals() {
    this[internals].ariaSelected = this.selected ? 'true' : 'false';

    this.focused
      ? this[internals].states.add('focused')
      : this[internals].states.delete('focused');

    this.selected
      ? this[internals].states.add('selected')
      : this[internals].states.delete('selected');
  }

  override focus() {
    this.focused = true;
    super.focus();
  }

  override blur() {
    this.focused = false;
    super.blur();
  }
}
