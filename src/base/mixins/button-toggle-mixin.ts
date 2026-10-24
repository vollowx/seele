import { property } from 'lit/decorators.js';
import {
  internals,
  updateInternals,
  replaceStates,
} from './internals-attached.js';
import { Button } from '../button.js';

const PROPERTY_FROM_ARIA_PRESSED = {
  true: 'checked',
  false: 'unchecked',
};

export declare class ToggleableInterface {
  checked: boolean;

  _ignoreClick: boolean;
  _toggle(): void;
}

export const ButtonToggleMixin = <T extends Constructor<Button>>(
  superClass: T
) => {
  class ButtonToggle extends superClass {
    @property({ type: Boolean }) checked = false;

    constructor(...args: any[]) {
      super();
      this.checked = this.hasAttribute('checked');
    }

    override connectedCallback(): void {
      super.connectedCallback();
      this.labels.forEach((label) => {
        label.addEventListener('click', this.#handleLabelClick);
      });
    }

    override disconnectedCallback(): void {
      this.labels.forEach((label) => {
        label.removeEventListener('click', this.#handleLabelClick);
      });
      super.disconnectedCallback();
    }

    override updated(changed: Map<string, any>) {
      if (changed.has('checked')) this[updateInternals]();
    }

    override [updateInternals](): void {
      super[updateInternals]();
      this[internals].ariaPressed = this.checked ? 'true' : 'false';
      this[replaceStates](
        ['unchecked', 'checked'],
        [PROPERTY_FROM_ARIA_PRESSED[this[internals].ariaPressed as 'true' | 'false']]
      );

      this[internals].setFormValue(this.checked ? 'on' : null);
    }

    /**
     * --> Drag-and-drop to the other side
     *
     * `checked` is supposed to be changed once
     *
     * 1. `pointerdown`: _ignoreClick = false
     * 2. `pointermove`: _ignoreClick = true
     * 3. `pointerup`: `checked` changed
     * 4. `click`: ignored, _ignoreClick = false
     *
     * --> Drag-and-drop to the other side, then click
     *
     * `checked` is supposed to be changed twice
     *
     * 1. `pointerdown`: _ignoreClick = false
     * 2. `pointermove`: _ignoreClick = true
     * 3. `pointerup`: `checked` changed(1)
     * 4. `click`: ignored, _ignoreClick = false
     * 5. `click`: `checked` changed(2)
     *
     * --> Drag-and-drop to the other side, then click the label
     *
     * `checked` is supposed to be changed twice
     *
     * 1. `pointerdown`: _ignoreClick = false
     * 2. `pointermove`: _ignoreClick = true
     * 3. `pointerup`: `checked` changed(1)
     * 4. `click` on label: _ignoreClick = false
     * 5. `click` on switch: `checked` changed(2)
     */
    _ignoreClick = false;

    #handleLabelClick() {
      this._ignoreClick = false;
    }

    override _handleClick(e: Event) {
      e.stopPropagation();
      e.preventDefault();
      if (this._ignoreClick) {
        this._ignoreClick = false;
        return;
      }
      this._toggle();
    }

    _toggle() {
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

    formResetCallback() {
      this.checked = this.hasAttribute('checked');
    }

    formStateRestoreCallback(state: string, _reason: string) {
      this.checked = state === 'on';
    }
  }

  return ButtonToggle as Constructor<ToggleableInterface> & T;
};
