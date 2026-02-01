import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export declare class AttachableInterface {
  $control: HTMLElement;
  htmlFor: string | null;
  attach(control: HTMLElement, force?: boolean): void;
  detach(): void;
  handleControlChange(prev: HTMLElement | null, next: HTMLElement | null): void;
}

export const Attachable = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class AttachableElement extends superClass {
    override connectedCallback() {
      super.connectedCallback();
      this.setCurrentControl(this.$control);
    }
    override disconnectedCallback() {
      this.setCurrentControl(null);
      super.disconnectedCallback();
    }

    /**
     * If has `for` attribute, use it to find the control element.
     * Otherwise, use the parent element as the control.
     */
    get $control() {
      if (this.hasAttribute('for')) {
        if (!this.htmlFor || !this.isConnected) {
          return null;
        }

        return (
          this.getRootNode() as Document | ShadowRoot
        ).querySelector<HTMLElement>(`#${this.htmlFor}`);
      }

      return this.currentControl || this.parentNode instanceof ShadowRoot
        ? ((this.parentNode as ShadowRoot).host as HTMLElement)
        : this.parentElement;
    }
    set $control(control: HTMLElement | null) {
      if (control) {
        this.attach(control);
      } else {
        this.detach();
      }
    }

    private currentControl: HTMLElement | null = null;

    @property({ attribute: 'for', type: String }) htmlFor: string | null;

    override updated(changed: Map<string, any>) {
      super.updated(changed);
      if (changed.has('htmlFor')) {
        // Will be triggered when first render using `for` attribute, will be
        // prevented in setCurrentControl since it's unnecessary.
        this.setCurrentControl(this.$control);
      }
    }

    private setCurrentControl(control: HTMLElement | null, force = false) {
      if (control === this.currentControl && !force) return;
      this.handleControlChange(this.currentControl, control);
      this.currentControl = control;
    }

    attach(control: HTMLElement, force = false) {
      this.setCurrentControl(control, force);
      this.removeAttribute('for');
    }
    detach() {
      this.setCurrentControl(null);
      this.setAttribute('for', '');
    }

    /**
     * Handles the first attaching and actual control element changing
     */
    handleControlChange(
      prev: HTMLElement | null = null,
      next: HTMLElement | null = null
    ) {}
  }
  return AttachableElement as Constructor<AttachableInterface> & T;
};
