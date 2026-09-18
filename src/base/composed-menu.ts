import { html } from 'lit';
import { query } from 'lit/decorators.js';

import { ensureReady } from '../core/ensure-ready.js';
import { internals } from './mixins/internals-attached.js';
import { handleControlChange } from './mixins/attachable.js';
import { Popup } from './popup.js';

import type { Menu } from './menu.js';

/**
 * A popup that wraps a `Menu`. Use this for standalone menus anchored to a
 * button or other control.
 *
 * @slot - menu items
 * @csspart menu - the internal menu part
 */
export class ComposedMenu extends Popup {
  @query('md-menu') $menu!: Menu;

  override render() {
    return html`<md-menu part="menu"><slot></slot></md-menu>`;
  }

  constructor() {
    super();
    this[internals].role = 'application';
  }

  override [handleControlChange](
    prev: HTMLElement | null,
    next: HTMLElement | null
  ): void {
    if (next) {
      next.ariaHasPopup = 'menu';
      ensureReady(this.$menu).then(() => {
        next.ariaControlsElements = [this.$menu];
        this.$menu[internals].ariaLabelledByElements = [next];
      });
    }
    super[handleControlChange](prev, next);
  }
}
