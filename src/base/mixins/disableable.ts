import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  internals,
  InternalsAttachedInterface,
  replaceStates,
  updateInternals,
} from './internals-attached';

export declare class DisableableInterface {
  disabled: boolean;
}

/**
 * This mixin is conflict with FormAssociated. It can be used in non-form-
 * associated scenarios, like menuitem, menuitemcheckbox, etc.
 *
 * The differences also include ElementInternals state disabled, which is just
 * `:disabled` and `:enabled` automatically using formAssociated, but becomes
 * `:state(disabled)` not using it.
 */
export const Disableable = <
  T extends Constructor<LitElement & InternalsAttachedInterface>,
>(
  superClass: T
) => {
  class DisableableElement extends superClass {
    @property({ type: Boolean, noAccessor: true })
    get disabled() {
      return this.hasAttribute('disabled');
    }
    set disabled(disabled: boolean) {
      this.toggleAttribute('disabled', disabled);
    }

    override attributeChangedCallback(
      name: string,
      old: string | null,
      value: string | null
    ) {
      if (name === 'disabled') {
        this.requestUpdate('disabled', old !== null);
        this[updateInternals]();
      }
      super.attributeChangedCallback(name, old, value);
    }

    override [updateInternals]() {
      super[updateInternals]?.();
      this[internals].ariaDisabled = String(this.disabled);
      this[replaceStates](
        ['disabled', 'enabled'],
        [this.disabled ? 'disabled' : 'enabled']
      );
    }
  }

  return DisableableElement as Constructor<DisableableInterface> & T;
};
