import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { InternalsAttached, internals } from './mixins/internals-attached.js';
import { genUniqueId } from '../core/unique-id.js';

export class TabPanel extends InternalsAttached(LitElement) {
  protected _role: string = 'tabpanel';

  override render() {
    return html`<slot></slot>`;
  }

  @property({ type: String, reflect: true }) value = '';

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('seele-base', 'tabpanel');
    this[internals].role = this._role;
    if (!this.id) this.id = genUniqueId('tabpanel');
  }
}
