import { LitElement } from 'lit';

import {
  InternalsAttached,
  internals,
  replaceStates,
  updateInternals,
} from './mixins/internals-attached.js';
import { Disableable } from './mixins/disableable.js';

import { hiddenStyles } from './hidden-styles.css.js';

import type { MenuList } from './menulist.js';

export class MenuItem extends Disableable(InternalsAttached(LitElement)) {
  get displayText(): string {
    return this.innerText.trim();
  }

  static override styles = [hiddenStyles];

  // Accessibility tools, particularly Narrator, only fires `click` event on
  // elements that have listeners for them.
  // #handleDummy() {}
  // TODO: test if it is still needed after items being directly focused
  constructor() {
    super();
    this[internals].role = 'menuitem';
    this[updateInternals]?.();
    // if (!isServer) this.addEventListener('click', this.#handleDummy);
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('seele-base')) {
      this.setAttribute('seele-base', 'menuitem');
    }
    this.ariaHasPopup = this.hasSubmenu ? 'menu' : null;
  }

  get $submenu(): MenuList | null {
    return this.querySelector<MenuList>('md-menu-list');
  }

  get hasSubmenu(): boolean {
    return this.$submenu !== null;
  }

  // Mirrors the submenu's `open` state; `MenuList` keeps it in sync so CSS can
  // style the trigger via `:state(submenu-open)`.
  #submenuOpen = false;
  get submenuOpen(): boolean {
    return this.#submenuOpen;
  }
  set submenuOpen(value: boolean) {
    if (this.#submenuOpen === value) return;
    this.#submenuOpen = value;
    this[replaceStates](['submenu-open'], [value ? 'submenu-open' : null]);
  }

  openSubmenu(focus = true) {
    const submenu = this.$submenu;
    if (!submenu) return;
    submenu.align = 'right-start';
    submenu.attach(this);
    if (focus && submenu.open) submenu.$menu?.focusFirstItem();
    else if (focus) submenu.show();
    else submenu.showWithoutFocus();
  }
}
