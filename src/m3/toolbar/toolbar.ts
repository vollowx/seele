import { LitElement, html, isServer } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import {
  internals,
  InternalsAttached,
} from '../../base/mixins/internals-attached.js';
import { ListController } from '../../base/controllers/list-controller.js';
import { getAllFocusables, isFocusable } from '../../core/focus.js';

import { toolbarStyles } from './toolbar-styles.css.js';

/**
 * @tag md-toolbar
 *
 * @csspart container
 * @csspart fab-slot
 *
 * @slot - toolbar contents
 * @slot fab - FAB element
 */
@customElement('md-toolbar')
export class M3Toolbar extends InternalsAttached(LitElement) {
  @property({ reflect: true }) type: 'docked' | 'floating' = 'docked';
  @property({ reflect: true }) color: 'standard' | 'vibrant' = 'standard';
  @property({ reflect: true }) orientation: 'horizontal' | 'vertical' =
    'horizontal';

  static override styles = [toolbarStyles];

  override render() {
    return html`
      <div part="container">
        <slot @slotchange=${this.#handleSlotChange}></slot>
      </div>
      <div part="fab-slot">
        <slot name="fab"></slot>
      </div>
    `;
  }

  constructor() {
    super();
    this[internals].role = 'toolbar';
    this[internals].ariaOrientation = this.orientation;
    if (!isServer) {
      this.addEventListener('keydown', this.#handleKeyDown.bind(this));
    }
  }

  private readonly listController = new ListController<HTMLElement>(this, {
    isItem: isFocusable,
    getPossibleItems: () => getAllFocusables(this.renderRoot),
    blurItem: (item: HTMLElement) => {
      item.tabIndex = -1;
    },
    focusItem: (item: HTMLElement) => {
      item.tabIndex = 0;
      item.focus({ preventScroll: true });
    },
    wrapNavigation: () => true,
    onFocusin: () => this.#rearrangeTabIndices(),
  });

  #handleSlotChange() {
    this.listController.handleSlotChange();
    this.#rearrangeTabIndices();
  }

  // Roving tabIndex: keep exactly one item tabbable (the active one, or the
  // first on init), so `Tab` enters the toolbar at a single item.
  #rearrangeTabIndices() {
    const items = this.listController.items;
    const focused = this.listController._focusedItem;
    const active = focused && items.includes(focused) ? focused : items[0];
    for (const item of items) {
      item.tabIndex = item === active ? 0 : -1;
    }
  }

  #handleKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;

    const vertical = this.orientation === 'vertical';
    const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';

    if (event.key === 'Home') {
      event.preventDefault();
      this.listController.focusFirstItem();
    } else if (event.key === 'End') {
      event.preventDefault();
      this.listController.focusLastItem();
    } else if (event.key === previousKey) {
      event.preventDefault();
      this.listController.focusPreviousItem();
    } else if (event.key === nextKey) {
      event.preventDefault();
      this.listController.focusNextItem();
    }
  }

  protected override firstUpdated() {
    this.#rearrangeTabIndices();
  }

  protected override updated(changed: Map<string, unknown>) {
    if (changed.has('orientation')) {
      this[internals].ariaOrientation = this.orientation;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-toolbar': M3Toolbar;
  }
}
