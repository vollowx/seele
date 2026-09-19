import { LitElement, html, PropertyValues, isServer } from 'lit';
import { property } from 'lit/decorators.js';
import {
  autoUpdate,
  computePosition,
  arrow,
  flip,
  offset,
  Placement,
  Strategy,
  shift,
} from '@floating-ui/dom';

import { getFirstTabbable } from '../core/focus.js';
import { InternalsAttached } from './mixins/internals-attached.js';
import {
  Attachable,
  autoAttachToParent,
  handleControlChange,
} from './mixins/attachable.js';
import { transformOriginFromArrow } from './positioning.js';

import { popupStyles } from './popup-styles.css.js';

/**
 * TODO: use [popover=auto]
 *
 * Light dismiss closes a popup for a click outside, and normally ignores the
 * trigger, yet non-button triggers are not recognized.
 * That makes clicking the trigger do
 * 1. light dismiss
 * 2. .toggle()
 * when the popup is open on mobile devices (tested on Safari mobile 26).
 *
 * I chose to use manual popovers, which effectively makes most of the benefits
 * of the use of Popover API lost. The workarounds should be removed after
 * custom elements can get button behavior natively.
 *
 * Ref:
 * - https://github.com/openui/open-ui/issues/1088
 * - https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/PlatformProvidedBehaviors/explainer.md
 * - https://github.com/whatwg/html/issues/12150
 */

/**
 * When using popup with menu, you need to manually bind them using `aria-controls`
 */
export class Popup extends Attachable(InternalsAttached(LitElement)) {
  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: Boolean, attribute: 'no-focus-control' })
  noFocusControl = false;

  @property({ type: String }) align: Placement = 'bottom-start';
  @property({ type: String }) strategy: Strategy = 'absolute';
  @property({ type: Number }) offset = 0;
  @property({ type: Number, attribute: 'window-padding' }) windowPadding = 8;

  $ariaControl: HTMLElement | null;

  static override styles = [popupStyles];
  override render() {
    return html`<slot></slot>`;
  }

  constructor() {
    super();
    this.setAttribute('notransition', '');
    if (!this.hasAttribute('popover')) this.setAttribute('popover', 'manual');
    if (!isServer) {
      this.addEventListener('request-popup-hide', this.#handleRequestHide);
      this.addEventListener('focusout', this.#handleFocusOut);
      this.addEventListener('keydown', this.#handleKeyDown);
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.#handleGlobalClick, true);
    window.addEventListener('pointerdown', this.#handleGlobalPointerDown);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => this.removeAttribute('notransition'))
    );
  }

  override disconnectedCallback() {
    this._cleanup();
    document.removeEventListener('click', this.#handleGlobalClick, true);
    window.removeEventListener('pointerdown', this.#handleGlobalPointerDown);
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    if (!changedProperties.has('open')) return;
    this.#syncTriggerAria();
    if (this.open) this.#show();
    else this.#hide();
  }

  override [autoAttachToParent] = false;
  override [handleControlChange](
    prev: HTMLElement | null,
    next: HTMLElement | null
  ): void {
    if (prev) {
      prev.removeEventListener('click', this.#handleTriggerClick);
      prev.removeEventListener('pointerdown', this.#handleTriggerPointerDown);
    }
    if (next) {
      next.addEventListener('click', this.#handleTriggerClick);
      next.addEventListener('pointerdown', this.#handleTriggerPointerDown);

      const ariaNext = this.$ariaControl ? this.$ariaControl : next;
      if (!next.ariaHasPopup) ariaNext.ariaHasPopup = 'true';
      ariaNext.ariaExpanded = String(this.open);
    }
  }

  #$lastFocused: HTMLElement | null = null;
  #pointerType: string | null = null;
  #pointerPath: EventTarget[] = [];

  #handleRequestHide = () => {
    if (this.open) {
      this.hide();
    }
  };

  #handleFocusOut = (e: FocusEvent) => {
    if (
      this.noFocusControl ||
      !this.open ||
      this.#pointerPath.includes(this.$control)
    )
      return;

    const target = e.relatedTarget as Node | null;

    if (this.contains(target)) return;

    if (target) {
      this.#$lastFocused = null;
      this.hide();
      return;
    }

    requestAnimationFrame(() => {
      if (!document.hasFocus()) this.hide();
    });
  };

  #handleKeyDown = (e: KeyboardEvent) => {
    this.#pointerPath = [];
    if (e.key !== 'Escape' || !this.open) return;

    const active = document.activeElement;
    if (!this.contains(active) && !this.noFocusControl) return;

    e.preventDefault();
    this.hide();
  };

  #handleTriggerClick = () => {
    // Ignore it if the popup is already opened by a mouse or pen.
    if (this.#pointerType && this.#pointerType !== 'touch') {
      this.#pointerType = null;
      return;
    }
    this.#pointerType = null;
    this.toggle();
  };

  #handleTriggerPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      this.#pointerType = null;
      return;
    }
    if (e.button !== 0) return;

    this.#pointerType = e.pointerType;
    this.toggle();
  };

  #handleGlobalClick = (e: MouseEvent) => {
    if (!this.open) return;

    const path = e.composedPath();
    if (path.includes(this) || path.includes(this.$control)) return;

    // 1. When a press started inside the popup is released outside of it
    // 2. When a press started on the trigger is released inside the popup
    if (
      this.#pointerPath.includes(this) ||
      this.#pointerPath.includes(this.$control)
    )
      return;

    this.hide();
  };

  #handleGlobalPointerDown = (event: PointerEvent) => {
    this.#pointerPath = event.composedPath();

    if (!this.open || event.pointerType === 'touch') return;
    if (
      this.#pointerPath.includes(this) ||
      this.#pointerPath.includes(this.$control)
    )
      return;

    this.hide();
  };

  #syncTriggerAria() {
    if (this.$ariaControl) this.$ariaControl.ariaExpanded = String(this.open);
    else if (this.$control) this.$control.ariaExpanded = String(this.open);
  }
  #focusFirstInteractiveElement() {
    if (this.noFocusControl) return;

    const autoFocus = this.querySelector<HTMLElement>('[autofocus]');
    if (autoFocus) {
      autoFocus.focus();
    } else {
      const firstTabbable = getFirstTabbable(this);
      firstTabbable?.focus();
    }
  }

  toggle() {
    this.open = !this.open;
  }
  show() {
    if (!this.open) this.open = true;
  }
  hide() {
    if (this.open) this.open = false;
  }

  async #show(): Promise<void> {
    this.#$lastFocused = this.$control
      ? this.$control
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const trigger = this.$control;

    if (this.isConnected && !this.matches(':popover-open'))
      this.showPopover({ source: trigger ?? undefined });

    if (trigger) {
      this._cleanup();
      this.#cleanupAutoUpdate = autoUpdate(trigger, this, () =>
        this.#reposition()
      );
      await this.#reposition();
    }

    requestAnimationFrame(() => {
      if (this.open) this.#focusFirstInteractiveElement();
    });
  }
  #hide() {
    this._cleanup();

    if (this.matches(':popover-open')) this.hidePopover();

    const lastFocused = this.#$lastFocused;
    this.#$lastFocused = null;

    if (!this.noFocusControl) lastFocused?.focus?.();
  }

  #cleanupAutoUpdate?: () => void;
  #dummyArrow = isServer ? null : document.createElement('div');
  async #reposition(): Promise<void> {
    const trigger = this.$control;
    if (!trigger) return Promise.resolve();

    return computePosition(trigger, this, {
      placement: this.align,
      strategy: this.strategy,
      middleware: [
        offset(this.offset),
        flip({ padding: this.windowPadding }),
        shift({ padding: this.windowPadding, crossAxis: true }),
        arrow({ element: this.#dummyArrow }),
      ],
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(this.style, {
        left: `${x}px`,
        top: `${y}px`,
        transformOrigin: transformOriginFromArrow(
          placement,
          middlewareData.arrow
        ),
      });
    });
  }
  _cleanup() {
    this.#cleanupAutoUpdate?.();
    this.#cleanupAutoUpdate = undefined;
  }
}
