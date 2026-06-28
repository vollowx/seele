import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { customElement } from '../../core/decorators.js';
import { focusVisible } from '../../core/focus-visible.js';
import { Attachable } from '../../base/mixins/attachable.js';
import {
  InternalsAttached,
  internals,
} from '../../base/mixins/internals-attached.js';

import { focusRingStyles } from './focus-ring-styles.css.js';

/**
 * @tag md-focus-ring
 *
 * @cssprop --md-focus-ring-active-width
 * @cssprop --md-focus-ring-color
 * @cssprop --md-focus-ring-duration
 * @cssprop --md-focus-ring-inward-offset
 * @cssprop --md-focus-ring-outward-offset
 * @cssprop --md-focus-ring-shape
 * @cssprop --md-focus-ring-shape-end-end
 * @cssprop --md-focus-ring-shape-end-start
 * @cssprop --md-focus-ring-shape-start-end
 * @cssprop --md-focus-ring-shape-start-start
 * @cssprop --md-focus-ring-width
 */
@customElement('md-focus-ring', false)
export class M3FocusRing extends Attachable(InternalsAttached(LitElement)) {
  @property({ type: Boolean, reflect: true }) inward = false;
  static override styles = [focusRingStyles];

  constructor() {
    super();
    this[internals].ariaHidden = 'true';
  }

  #handleFocusIn = () => {
    if (focusVisible) this[internals].states.add('visible');
    else this[internals].states.delete('visible');
  }
  #handleFocusOut = () => {
    this[internals].states.delete('visible');
  }
  #handlePointerDown = () => {
    this[internals].states.delete('visible');
  }

  visualFocus() {
    this.#handleFocusIn();
  }

  visualBlur() {
    this.#handleFocusOut();
  }

  override handleControlChange(
    prev: HTMLElement | null = null,
    next: HTMLElement | null = null
  ) {
    const eventHandlers = {
      focusin: this.#handleFocusIn,
      focusout: this.#handleFocusOut,
      pointerdown: this.#handlePointerDown,
    };

    Object.keys(eventHandlers).forEach((eventName) => {
      prev?.removeEventListener(eventName, eventHandlers[eventName]);
      next?.addEventListener(eventName, eventHandlers[eventName]);
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-focus-ring': M3FocusRing;
  }
}
