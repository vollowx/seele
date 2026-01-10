import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { InternalsAttached, internals } from './mixins/internals-attached.js';
import { FormAssociated } from './mixins/form-associated.js';

import { hiddenStyles } from './hidden-styles.css.js';

const PROPERTY_FROM_ARIA_PRESSED = {
  true: 'checked',
  false: 'unchecked',
};

const Base = FormAssociated(InternalsAttached(LitElement));

export class Switch extends Base {
  static override styles = [hiddenStyles];

  @property({ type: Boolean }) checked = false;

  constructor() {
    super();
    this[internals].role = 'switch';

    this.checked = this.hasAttribute('checked');
    this.updateInternals();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeyDown);
    this.addEventListener('keyup', this.#handleKeyUp);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.removeEventListener('keyup', this.#handleKeyUp);
  }

  protected override updated(changed: Map<string, any>) {
    if (changed.has('checked') || changed.has('disabled')) {
      this.updateInternals();
    }
  }

  private updateInternals() {
    this[internals].states.delete('unchecked');
    this[internals].states.delete('checked');
    this[internals].ariaPressed = this.checked ? 'true' : 'false';
    this[internals].states.add(
      `${PROPERTY_FROM_ARIA_PRESSED[this[internals].ariaPressed]}`
    );

    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    this[internals].ariaDisabled = this.disabled ? 'true' : 'false';

    this[internals].setFormValue(this.checked ? 'on' : null);
  }

  _ignoreClick = false;

  #handleClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    if (this._ignoreClick) return;
    this.#toggleChecked();
  };

  #handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Enter') this.#toggleChecked();
  };

  #handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      this.#toggleChecked();
    }
  };

  #toggleChecked() {
    if (this.disabled) return;

    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: this.checked,
      })
    );
  }
}
