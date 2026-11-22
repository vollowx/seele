import { html, PropertyValues } from 'lit';
import { query } from 'lit/decorators.js';

import { ensureReady } from '../core/ensure-ready.js';
import { internals } from './mixins/internals-attached.js';
import { handleControlChange } from './mixins/attachable.js';
import { Popup } from './popup.js';
import { MenuItem } from './menuitem.js';

import type { Menu } from './menu.js';

/**
 * A popup that wraps a `Menu`. Use this for standalone menus anchored to a
 * button or other control.
 *
 * @slot - menu items
 * @csspart menu - the internal menu part
 */
export class MenuList extends Popup {
  @query('md-menu') $menu!: Menu | null;

  #focusOnOpen = true;

  override render() {
    return html`<md-menu part="menu"><slot></slot></md-menu>`;
  }

  constructor() {
    super();
    this[internals].role = 'application';
    this[internals].ariaRoleDescription = 'Menu';
    this.addEventListener('keydown', this.#handleSubmenuKeyDown.bind(this));
    // You should set this to "Menu" in the language of your webpage
  }

  override [handleControlChange](
    prev: HTMLElement | null,
    next: HTMLElement | null
  ): void {
    if (next) {
      next.ariaHasPopup = 'menu';
      this.updateComplete.then(() => {
        const menu = this.$menu!;
        ensureReady(menu).then(() => {
          next.ariaControlsElements = [menu];
          menu[internals].ariaLabelledByElements = [next];
        });
      });
    }
    // A submenu (control is a MenuItem) is opened/closed by its parent Menu,
    // not by Popup's trigger click/pointerdown listeners.
    if (!(next instanceof MenuItem)) {
      super[handleControlChange](prev, next);
    }
  }

  // ArrowLeft closes the submenu and returns focus to its parent item. Handled
  // here (not in `Menu`) so a nested `md-menu-list` closes itself without the
  // parent menu-list also reacting.
  #handleSubmenuKeyDown(e: KeyboardEvent) {
    if (e.key !== 'ArrowLeft' || !this.open) return;
    if (!(this.$control instanceof MenuItem)) return;
    e.preventDefault();
    e.stopPropagation();
    this.hide();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('open') && !this.open) this.#closeSubmenus();
    super.updated(changed);
    // Keep the trigger item's `:state(submenu-open)` in sync with the submenu.
    if (changed.has('open')) {
      const control = this.$control;
      if (control instanceof MenuItem) control.submenuOpen = this.open;
      if (!this.open) this.#focusOnOpen = true;
    }
  }

  showWithoutFocus() {
    if (this.open) return;
    this.#focusOnOpen = false;
    super.show();
  }

  override hide() {
    this.#closeSubmenus();
    super.hide();
  }

  protected override _isPointerDownInside(): boolean {
    return (
      super._isPointerDownInside() ||
      (this.$control instanceof MenuItem &&
        (this.$control.closest<MenuList>('md-menu-list')?._isPointerDownInside() ??
          false))
    );
  }

  #closeSubmenus() {
    this.$menu?.clearHoverTimers();
    for (const item of this.$menu?.slotItems ?? []) {
      item.$submenu?.hide();
    }
  }

  override _focusFirstInteractiveElement() {
    if (this.#focusOnOpen) this.$menu!.focusFirstItem();
    this.#focusOnOpen = true;
  }
}
