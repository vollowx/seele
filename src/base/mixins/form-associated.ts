import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { internals } from './internals-attached.js';

export declare class FormAssociatedInterface {
  form: HTMLFormElement | null;
  labels: NodeList;
  name: string | null;
  disabled: boolean;
  validity: ValidityState;
  validationMessage: string;
  willValidate: boolean;

  formDisabledCallback(disabled: boolean): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}

export const FormAssociated = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class FormAssociatedElement extends superClass {
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

    @property({ type: Boolean, noAccessor: true })
    get disabled() {
      return this.hasAttribute('disabled');
    }
    set disabled(disabled: boolean) {
      this.toggleAttribute('disabled', disabled);
      // We don't need to call `requestUpdate()` since it's called synchronously
      // in `attributeChangedCallback()`.
    }

    override attributeChangedCallback(
      name: string,
      old: string | null,
      value: string | null
    ) {
      if (name === 'disabled') {
        this.requestUpdate('disabled', old !== null);
      }
      super.attributeChangedCallback(name, old, value);
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
