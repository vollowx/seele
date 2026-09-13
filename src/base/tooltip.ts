import { LitElement, html, isServer } from 'lit';
import { property, query } from 'lit/decorators.js';

import {
  autoUpdate,
  computePosition,
  arrow,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';

import { focusVisible } from '../core/focus.js';
import { Attachable, handleControlChange } from './mixins/attachable.js';
import { InternalsAttached, internals } from './mixins/internals-attached.js';
import { transformOriginFromArrow } from './positioning.js';

let lastHidingTime = 0;

const Base = Attachable(InternalsAttached(LitElement));

/**
 * TODO: Check if $control controls a menu/popover and keep hidden when it is open.
 * TODO: Allow adding a real arrow
 */
export class Tooltip extends Base {
  readonly _delays = {
    mouse: { show: 500, hide: 0 },
    focus: { show: 100, hide: 0 },
    touch: { show: 700, hide: 1500 },
    recentlyShowed: 800,
  };

  @property({ reflect: true }) align: import('@floating-ui/dom').Placement =
    'top';
  @property({ type: Number, reflect: true }) offset = 4;
  @property({ type: Number, attribute: 'window-padding' }) windowPadding = 8;
  @property({ type: Boolean, reflect: true, attribute: 'force-invisible' })
  forceInvisible = false;

  @query('slot') $slot: HTMLSlotElement;

  override render() {
    return html`<slot @slotchange="${this.#handleSlotChange}"></slot>`;
  }

  // Used to manage the delay before showing/hiding the tooltip.
  #openTimer: NodeJS.Timeout = null;
  #closeTimer: NodeJS.Timeout = null;

  #visible = false;
  get visible() {
    return this.#visible;
  }
  set visible(value: boolean) {
    if (value) this.#show();
    else this.#hide();
  }

  constructor() {
    super();
    this[internals].role = 'tooltip';
    if (!this.hasAttribute('popover')) this.setAttribute('popover', 'manual');
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('pointerup', this.#handleGlobalPointerUp);
  }

  override disconnectedCallback() {
    this._cleanup();
    window.removeEventListener('pointerup', this.#handleGlobalPointerUp);
    super.disconnectedCallback();
  }

  override [handleControlChange](
    prev: HTMLElement | null = null,
    next: HTMLElement | null = null
  ) {
    const eventHandlers = {
      focusin: this.#handleFocusIn,
      focusout: this.#handleFocusOut,
      pointerenter: this.#handlePointerEnter,
      pointerleave: this.#handlePointerLeave,
      touchstart: this.#handleTouchStart,
      touchend: this.#handleTouchEnd,
    };

    Object.keys(eventHandlers).forEach((key) => {
      prev?.removeEventListener(key, eventHandlers[key]);
      next?.addEventListener(key, eventHandlers[key]);
    });

    if (prev) prev.removeAttribute('aria-label');
    if (next) next.setAttribute('aria-label', this.textContent ?? '');
  }

  async #show() {
    if (this.#visible) return;
    this.#visible = true;

    clearTimeout(this.#openTimer);
    clearTimeout(this.#closeTimer);

    const trigger = this.$control;

    if (trigger) {
      this._cleanup();
      this.#cleanupAutoUpdate = autoUpdate(trigger, this, () =>
        this.reposition()
      );
      await this.reposition();
    }

    if (this.isConnected && !this.matches(':popover-open'))
      this.showPopover({ source: trigger ?? undefined });
  }

  async #hide() {
    if (!this.#visible) return;
    this.#visible = false;

    clearTimeout(this.#openTimer);
    clearTimeout(this.#closeTimer);

    this._cleanup();

    if (this.matches(':popover-open')) this.hidePopover();
  }

  #handleSlotChange = () => {
    if (!this.visible)
      this.$control.setAttribute('aria-label', this.textContent ?? '');
  };

  #handleFocusIn = () => {
    if (!focusVisible) return;
    this.#scheduleShow(this._delays.focus.show, true);
  };

  #handleFocusOut = () => {
    this.#scheduleHide(this._delays.focus.hide);
  };

  #handlePointerEnter = (e: Event) => {
    const evt = e as PointerEvent;
    if (evt.pointerType === 'touch') return;
    this.#scheduleShow(this._delays.mouse.show, true);
  };

  #handlePointerLeave = (e: Event) => {
    const evt = e as PointerEvent;
    if (evt.pointerType === 'touch') return;
    this.#scheduleHide(this._delays.mouse.hide);
  };

  #handleTouchStart = () => {
    this.#scheduleShow(this._delays.touch.show);
  };

  #handleTouchEnd = () => {
    this.#scheduleHide(this._delays.touch.hide);
  };

  #handleGlobalPointerUp = (event: MouseEvent) => {
    const trigger = this.$control;
    const path = event.composedPath();

    if (trigger && path.includes(trigger)) return;
    if (path.includes(this)) return;

    this.visible = false;
  };

  #scheduleShow(delay: number, allowInstantShow = false) {
    clearTimeout(this.#closeTimer);
    this.#openTimer = setTimeout(
      () => {
        this.visible = true;
      },
      allowInstantShow &&
        Date.now() - lastHidingTime < this._delays.recentlyShowed
        ? 0
        : delay
    );
  }

  #scheduleHide(delay: number) {
    if (this.visible) {
      lastHidingTime = Date.now();
    }
    clearTimeout(this.#openTimer);
    this.#closeTimer = setTimeout(() => {
      this.visible = false;
    }, delay);
  }

  #cleanupAutoUpdate?: () => void;
  #dummyArrow = isServer ? null : document.createElement('div');
  async reposition() {
    const trigger = this.$control;
    if (!trigger) return Promise.resolve();

    return computePosition(trigger, this, {
      placement: this.align,
      strategy: 'absolute',
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
