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
  overriddenTabIndex: number | null;
  _syncTabIndex(): void;
  [updateInternals](): void;
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
    #overriddenTabIndex: number | null = null;

    // Setting tabIndex from outside always creates an overriddenTabIndex; to
    // cancel the overridding, call `.removeAttribute('tabindex')`.
    get overriddenTabIndex(): number | null {
      return this.#overriddenTabIndex;
    }

    override get tabIndex() {
      return super.tabIndex;
    }
    override set tabIndex(value: number) {
      this.#overriddenTabIndex = value;
      super.tabIndex = this.disabled ? -1 : value;
    }

    _syncTabIndex() {
      super.tabIndex = this.disabled ? -1 : (this.#overriddenTabIndex ?? 0);
    }

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
      if (name === 'tabindex' && value === null) {
        // removeAttribute
        this.#overriddenTabIndex = null;
        this._syncTabIndex();
      } else if (name === 'disabled') {
        this.requestUpdate('disabled', old !== null);
        this[updateInternals]();
      }
      super.attributeChangedCallback(name, old, value);
    }

    override [updateInternals]() {
      super[updateInternals]?.();
      this._syncTabIndex();
      this[internals].ariaDisabled = String(this.disabled);
      this[replaceStates](
        ['disabled', 'enabled'],
        [this.disabled ? 'disabled' : 'enabled']
      );
    }
  }

  return DisableableElement as Constructor<DisableableInterface> & T;
};
