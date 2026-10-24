import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { customElement } from '../../core/decorators.js';
import type { ToggleButton } from '../../base/toggle-button.js';
import { connectedButtonGroupStyles } from './connected-button-group-styles.css.js';

/**
 * @tag md-connected-button-group
 *
 * @slot - toggle buttons
 */
@customElement('md-connected-button-group')
export class M3ConnectedButtonGroup extends LitElement {
  @property({ type: Boolean }) multiple = false;
  @queryAssignedElements() $buttons!: Array<ToggleButton>;

  static override styles = [connectedButtonGroupStyles];
  override render() {
    return html`<slot @change=${this.#handleChange}></slot>`;
  }

  #handleChange = (e: Event) => {
    this.$buttons.forEach((btn, _) => {
      if (btn !== e.target && !this.multiple)
        // NOTE: there will not be an event dispatched and user should listen on
        //       the button group directly.
        btn.checked = false;
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-connected-button-group': M3ConnectedButtonGroup;
  }
}
