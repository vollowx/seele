import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import {
  InternalsAttachedInterface,
  internals,
} from './internals-attached.js';
import { Disableable, DisableableInterface } from './disableable.js';

export declare class FormAssociatedInterface extends DisableableInterface {
  form: HTMLFormElement | null;
  labels: NodeList;
  name: string | null;
  validity: ValidityState;
  validationMessage: string;
  willValidate: boolean;

  formDisabledCallback(disabled: boolean): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}


/**
  * Note that form-associated elements can be `:disabled` and `:enabled`, by the
  * browser, yet `:state(disabled)` from `Disableable` is kept.
  */
export const FormAssociated = <
  T extends Constructor<LitElement & InternalsAttachedInterface>,
>(
  superClass: T
) => {
  class FormAssociatedElement extends Disableable(superClass) {
    static formAssociated = true;

    get form() {
      return this[internals].form;
    }
    get labels() {
      return this[internals].labels;
    }

    // From https://github.com/material-components/material-web/blob/main/labs/behaviors/form-associated.ts
    // Use @property for the `name` and `disabled` properties to add them to the
    // `observedAttributes` array and trigger `attributeChangedCallback()`.
    //
    // We don't use Lit's default getter/setter (`noAccessor: true`) because
    // the attributes need to be updated synchronously to work with synchronous
    // form APIs, and Lit updates attributes async by default.
    @property({ noAccessor: true })
    get name() {
      return this.getAttribute('name') ?? '';
    }
    set name(name: string) {
      // Note: setting name to null or empty does not remove the attribute.
      this.setAttribute('name', name);
      // We don't need to call `requestUpdate()` since it's called synchronously
      // in `attributeChangedCallback()`.
    }

    get validity() {
      return this[internals].validity;
    }
    get validationMessage() {
      return this[internals].validationMessage;
    }
    get willValidate() {
      return this[internals].willValidate;
    }

    formDisabledCallback(disabled: boolean) {
      this.disabled = disabled;
    }
    checkValidity() {
      return this[internals].checkValidity();
    }
    reportValidity() {
      return this[internals].reportValidity();
    }
  }

  return FormAssociatedElement as Constructor<FormAssociatedInterface> & T;
};
