import { LitElement, html } from 'lit';
import { internals, InternalsAttached } from './mixins/internals-attached.js';

/**
 * @csspart items
 */
export class List extends InternalsAttached(LitElement) {
  protected _role = 'list';

  override render() {
    return html`<slot part="items"></slot>`;
  }

  override connectedCallback() {
    super.connectedCallback();
    this[internals].role = this._role;
  }
}
