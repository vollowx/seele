import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export const autoAttachToParent = Symbol('autoAttachToParent');
export const handleControlChange = Symbol('handleControlChange');

export declare class AttachableInterface {
  $control: HTMLElement | null;
  htmlFor: string | null;
  attach(control: HTMLElement, force?: boolean): void;
  detach(): void;
  [autoAttachToParent]: boolean;
  [handleControlChange](
    prev: HTMLElement | null,
    next: HTMLElement | null
  ): void;
}

export const Attachable = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class AttachableElement extends superClass {
    /**
     * If has `for` attribute, use it to find the control element.
     * Otherwise, use the parent element as the control.
     */
    get $control() {
      if (this.hasAttribute('for')) {
        if (!this.htmlFor || !this.isConnected) {
          return null;
        }

        const root = this.getRootNode() as Document | ShadowRoot;
        if (!root || !('querySelector' in root)) {
          return null;
        }

        return root.querySelector<HTMLElement>(`#${CSS.escape(this.htmlFor)}`);
      }

      if (this.#$control) {
        return this.#$control;
      }

      if (!this[autoAttachToParent]) {
        return null;
      }

      return this.parentNode instanceof ShadowRoot
        ? (this.parentNode.host as HTMLElement)
        : this.parentElement;
    }
    set $control(control: HTMLElement | null) {
      if (control) {
        this.attach(control);
      } else {
        this.detach();
      }
    }

    @property({ attribute: 'for', type: String }) htmlFor!: string | null;

    override connectedCallback() {
      super.connectedCallback();
      this.#setControl(this.$control);
    }
    override disconnectedCallback() {
      this.#setControl(null);
      super.disconnectedCallback();
    }
    override firstUpdated(changed: Map<string, any>) {
      super.firstUpdated(changed);
      // When the control element is placed after `this` and wasn't parsed yet
      // at `connectedCallback`.

      if (!this.#$control && this.htmlFor) {
        this.#setControl(this.$control);
      }
    }
    override updated(changed: Map<string, any>) {
      super.updated(changed);
      if (changed.has('htmlFor')) {
        // Will be triggered when first render using `for` attribute, will be
        // prevented in #setControl since it's unnecessary.
        this.#setControl(this.$control);
      }
    }

    attach(control: HTMLElement, force = false) {
      this.#setControl(control, force);
      this.removeAttribute('for');
    }
    detach() {
      this.#setControl(null);
      this.removeAttribute('for');
      this[autoAttachToParent] = false;
      // That is to prevent attaching automatically on a `$control` access.
      // (yet, I don't even know who would call `detach()`) :/
    }

    /**
     * The control element currently attached to
     */
    #$control: HTMLElement | null = null;
    #setControl(control: HTMLElement | null, force = false) {
      if (control === this.#$control && !force) return;
      this[handleControlChange](this.#$control, control);
      this.#$control = control;
    }

    /**
     * Whether `parentNode` is a candidate of `$control`.
     *
     * When false, only `id` is considered without manually setting `$control`
     * or `attach()`
     */
    [autoAttachToParent] = true;

    /**
     * Handles the first attaching and actual control element changing
     */
    [handleControlChange](
      _prev: HTMLElement | null = null,
      _next: HTMLElement | null = null
    ) {
      console.warn(
        '[seele] You should implement [onControlChange] on any class that mixes Attachable'
      );
    }
  }
  return AttachableElement as Constructor<AttachableInterface> & T;
};
