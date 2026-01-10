import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { InternalsAttached, internals } from './mixins/internals-attached.js';
import { FormAssociated } from './mixins/form-associated.js';
import { hiddenStyles } from './hidden-styles.css.js';

const Base = FormAssociated(InternalsAttached(LitElement));

export class Button extends Base {
  static override styles = [hiddenStyles];

  @property({ reflect: true }) type: 'button' | 'submit' | 'reset' = 'button';

  constructor() {
    super();
    this[internals].role = 'button';
    this.updateState();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.#handleKeyDown);
    this.addEventListener('keyup', this.#handleKeyUp);
    this.addEventListener('click', this.#handleClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.removeEventListener('keyup', this.#handleKeyUp);
    this.removeEventListener('click', this.#handleClick);
  }

  protected override updated(changed: Map<string, any>) {
    if (changed.has('disabled')) this.updateState();
  }

  protected updateState() {
    this.tabIndex = this.disabled ? -1 : 0;
    this[internals].ariaDisabled = String(this.disabled);
  }

  #handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Enter') this.click();
  };

  #handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      this.click();
    }
  };

  #handleClick = () => {
    if (this.type !== 'button') this[internals].form?.[this.type]();
  };
}
