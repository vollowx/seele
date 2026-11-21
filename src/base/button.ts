import { isServer, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import {
  InternalsAttached,
  internals,
  updateInternals,
} from './mixins/internals-attached.js';
import { FormAssociated } from './mixins/form-associated.js';
import { hiddenStyles } from './hidden-styles.css.js';

const Base = FormAssociated(InternalsAttached(LitElement));

export class Button extends Base {
  @property({ reflect: true }) type: 'button' | 'submit' | 'reset' = 'button';

  static override styles = [hiddenStyles];

  constructor() {
    super();
    this[internals].role = 'button';
    this[updateInternals]();

    // This is set to prevent a first-paint-time transition for styles like
    // `border-radius` on `:host`. Also in `ToggleButton`.
    // Double `requestAnimationFrame` is necessary since the callback inside is
    // called before the nth frame is printed.
    this.setAttribute('notransition', '');

    if (!isServer) {
      this.addEventListener('keydown', this.#handleKeyDown);
      this.addEventListener('keyup', this.#handleKeyUp);
      this.addEventListener('click', this._handleClick.bind(this));
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => this.removeAttribute('notransition'))
    );
  }

  #handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Enter') this.click();
    else this[internals].states.add('active');
    // TODO: consider handle `pointerdown` and ditch native `:active` selector
    // TODO: supporting `Enter` also requires listening on `focusout`
  };

  #handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ' && this[internals].states.has('active')) {
      this[internals].states.delete('active');
      e.preventDefault();
      e.stopPropagation();
      this.click();
    }
  };

  _handleClick(e: Event) {
    if (this.type !== 'button') this[internals].form?.[this.type]();
  }
}
