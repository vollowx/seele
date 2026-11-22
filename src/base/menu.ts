import { LitElement, PropertyValues, html, isServer } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import { focusVisible, setFocusVisible } from '../core/focus.js';
import { internals, InternalsAttached } from './mixins/internals-attached.js';
import {
  ListController,
  rovingFocusPreset,
} from './controllers/list-controller.js';

import type { MenuItem } from './menuitem.js';

// Same as Windows menu delay
const MENU_SHOW_DELAY = 400;

export interface MenuEventDetail {
  item: MenuItem;
  index: number;
}
export type MenuActionEvent = CustomEvent<MenuEventDetail>;
export type MenuItemFocusEvent = CustomEvent<MenuEventDetail>;

/**
 * @csspart items
 * @slot - menu items
 * @fires {MenuActionEvent} action - Fires when an item is activated.
 * @fires {MenuItemFocusEvent} item-focus - Fires when an item is focused.
 * @fires {Event} request-popup-hide - Fires when menu should be hidden.
 */
export class Menu extends InternalsAttached(LitElement) {
  /**
   * When true, emits `request-popup-hide` on `action`
   */
  @property({ type: Boolean, attribute: 'keep-open-action' })
  keepOpenAction = false;

  /**
   * When true, disables the menu's default focus management.
   */
  @property({ type: Boolean, reflect: true })
  bare = false;

  @queryAssignedElements({ flatten: true }) slotItems!: Array<MenuItem>;
  get $items() {
    return this.listController.items;
  }

  get currentIndex() {
    return this.listController?.currentIndex;
  }
  focusFirstItem() {
    if (!this.bare) this.listController.focusFirstItem();
  }
  focusLastItem() {
    if (!this.bare) this.listController.focusLastItem();
  }
  focusItem(item: MenuItem) {
    if (!this.bare) this.listController.focusItem(item);
  }

  override render() {
    return html`<slot
      part="items"
      @slotchange=${this.listController.handleSlotChange}
    ></slot>`;
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('bare') && !isServer) {
      if (this.bare) {
        this.clearHoverTimers();
        this.listController.resetFocusTracking();
      } else {
        const root = this.getRootNode();
        const active =
          root instanceof Document || root instanceof ShadowRoot
            ? root.activeElement
            : null;
        const item = this.$items.find((entry) => entry === active);
        if (item) this.listController.trackItem(item);
        this.listController.requestReconcile();
      }
    }
  }

  protected override firstUpdated() {
    this.#rovingFocusPreset.rearrange();
  }

  constructor() {
    super();
    this[internals].role = 'menu';
    if (!isServer) {
      this.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.addEventListener('pointerover', this.#handlePointerOver.bind(this));
      this.addEventListener('pointerout', this.#handlePointerOut.bind(this));
      this.addEventListener('click', this.#handleClick.bind(this));
      this.addEventListener('pointerdown', this.#handlePointerDown.bind(this));
      this.addEventListener('pointerup', this.#handlePointerUp.bind(this));
    }
  }

  override disconnectedCallback() {
    this.clearHoverTimers();
    super.disconnectedCallback();
  }

  readonly #rovingFocusPreset = rovingFocusPreset<MenuItem>(
    () => this.listController,
    () => !this.bare
  );
  private readonly listController = new ListController<MenuItem>(this, {
    isItem: (item: HTMLElement): item is MenuItem =>
      item.getAttribute('seele-base') === 'menuitem' &&
      !item.hasAttribute('disabled') &&
      !item.hidden,
    getPossibleItems: () => this.slotItems,
    blurItem: (item: MenuItem) => {
      if (!this.bare) item.tabIndex = -1;
    },
    focusItem: (item: MenuItem) => {
      item.tabIndex = 0;
      item.focus({ preventScroll: true });
      if (focusVisible) item.scrollIntoView({ block: 'nearest' });
      this.dispatchEvent(
        new CustomEvent('item-focus', {
          detail: { item, index: this.$items.indexOf(item) },
          bubbles: true,
          composed: true,
        })
      );
    },
    wrapNavigation: () => true,
    ...this.#rovingFocusPreset,
  });

  handleKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented || this.bare) return;

    this.clearHoverTimers();
    const action = getActionFromKey(event);
    const items = this.$items;
    const currentIndex = this.listController.currentIndex;
    const maxIndex = items.length - 1;

    switch (action) {
      case MenuAction.First:
        event.preventDefault();
        this.listController.focusFirstItem();
        return;
      case MenuAction.Last:
        event.preventDefault();
        this.listController.focusLastItem();
        return;
      case MenuAction.PageUp:
      case MenuAction.PageDown: {
        event.preventDefault();
        const { first, last, pageSize } = getVisibleItems(this, items);
        const isDown = action === MenuAction.PageDown;

        const boundary = isDown ? last : first;
        const atBoundary = isDown
          ? currentIndex >= last
          : currentIndex <= first;
        const step = isDown ? pageSize : -pageSize;

        const nextIndex = atBoundary ? currentIndex + step : boundary;

        this.listController.focusItem(
          items[Math.max(0, Math.min(maxIndex, nextIndex))]
        );
        return;
      }
      case MenuAction.Next:
        event.preventDefault();
        this.listController.focusNextItem();
        return;
      case MenuAction.Previous:
        event.preventDefault();
        this.listController.focusPreviousItem();
        return;
      case MenuAction.CloseSelect:
        event.preventDefault();
        if (currentIndex >= 0) {
          this.#activateOrOpen(items[currentIndex], currentIndex);
        }
        return;
      case MenuAction.Open:
        event.preventDefault();
        if (currentIndex >= 0) {
          items[currentIndex].openSubmenu();
        }
        return;
      case MenuAction.Type:
        this.listController.handleType(event.key);
        return;
    }
  }

  #hoverItem: MenuItem | null = null;
  #hoverTimer: number | null = null;

  clearHoverTimers() {
    if (this.#hoverTimer !== null) window.clearTimeout(this.#hoverTimer);
    this.#hoverTimer = null;
    this.#hoverItem = null;
  }

  #handlePointerOver(event: PointerEvent) {
    if (this.bare) return;
    if (event.pointerType === 'pen') {
      const item = this.#getItemFromEvent(event);
      if (item && this.currentIndex !== item.index) {
        setFocusVisible(false);
        this.listController.focusItem(item.item);
      }
      return;
    }
    if (event.pointerType !== 'mouse') return;
    const item = this.#getPointerItem(event);
    if (!item) {
      if (
        this.slotItems.some(
          (entry) =>
            entry.$submenu?.open &&
            event.composedPath().includes(entry.$submenu)
        )
      ) {
        this.clearHoverTimers();
      }
      return;
    }
    if (this.#hoverItem === item) return;
    this.clearHoverTimers();
    this.#hoverItem = item;
    setFocusVisible(false);

    const openSubmenus = this.slotItems
      .filter((entry) => entry !== item && entry.$submenu?.open)
      .map((entry) => entry.$submenu!);
    const root = this.getRootNode();
    const active = root instanceof ShadowRoot ? root.host.getRootNode() : root;

    if (
      openSubmenus.length === 0 &&
      !item.disabled &&
      !item.$submenu?.contains(
        active instanceof Document || active instanceof ShadowRoot
          ? active.activeElement
          : null
      )
    ) {
      this.listController.focusItem(item);
    }

    if (
      openSubmenus.length ||
      (item.hasSubmenu && !item.disabled && !item.$submenu?.open)
    ) {
      this.#hoverTimer = window.setTimeout(async () => {
        this.#hoverTimer = null;
        if (this.bare || !this.isConnected) return;
        for (const submenu of openSubmenus) submenu.hide();
        await Promise.all(
          openSubmenus.map((submenu) => submenu.updateComplete)
        );
        if (this.#hoverItem !== item || !this.isConnected || this.bare) return;
        if (!item.disabled) {
          this.listController.focusItem(item);
          if (item.hasSubmenu) item.openSubmenu(false);
        }
      }, MENU_SHOW_DELAY);
    }
  }

  #handlePointerOut(event: PointerEvent) {
    if (this.bare || event.pointerType !== 'mouse') return;
    const next = event.relatedTarget as Node | null;
    if (this.#hoverItem && !this.#hoverItem.contains(next)) {
      this.clearHoverTimers();
    }

    const shadowRoot = this.getRootNode();
    let root: HTMLElement =
      shadowRoot instanceof ShadowRoot &&
      shadowRoot.host instanceof HTMLElement &&
      shadowRoot.host.localName === 'md-menu-list'
        ? shadowRoot.host
        : this;
    let parent = root.parentElement?.closest('md-menu-list');
    while (parent) {
      root = parent;
      parent = root.parentElement?.closest('md-menu-list');
    }
    if (root.contains(next)) return;

    const rootNode = root.getRootNode();
    const active =
      rootNode instanceof Document || rootNode instanceof ShadowRoot
        ? rootNode.activeElement
        : null;
    if (!(active instanceof HTMLElement) || !root.contains(active)) return;
    const menu = active.parentElement?.closest('md-menu-list')?.$menu ?? this;
    const focused = menu.listController.focusedItem;
    if (focused !== active) return;
    menu.listController.blurItem(focused);
    menu.tabIndex = -1;
    menu.focus({ preventScroll: true });
  }

  #handleClick(event: MouseEvent) {
    if (this.#suppressClick) {
      this.#suppressClick = false;
      return;
    }

    const item = this.#getItemFromEvent(event);
    if (!item) return;

    this.#activateOrOpen(item.item, item.index);
  }

  #suppressClick = false;
  #handlePointerDown(event: PointerEvent) {
    this.#suppressClick = false;
    if (this.bare || event.pointerType !== 'mouse' || event.button !== 0)
      return;
    const item = this.#getItemFromEvent(event);
    if (!item?.item.hasSubmenu) return;
    this.clearHoverTimers();
    for (const entry of this.slotItems) {
      if (entry !== item.item) entry.$submenu?.hide();
    }
    item.item.openSubmenu(false);
  }

  #handlePointerUp(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    if (event.button !== 0) return;

    const item = this.#getItemFromEvent(event);
    if (!item) return;

    // Ignore the `click` that follows a mouse release on an item.
    this.#suppressClick = true;
    window.setTimeout(() => (this.#suppressClick = false), 0);
    if (event.pointerType === 'mouse' && item.item.hasSubmenu) return;
    this.clearHoverTimers();
    this.#activateOrOpen(item.item, item.index);
  }

  #getPointerItem(event: Event) {
    const item = (event.target as HTMLElement).closest<MenuItem>(
      '[seele-base=menuitem]'
    );
    if (!item || item.hidden || !this.slotItems.includes(item)) return null;
    return item;
  }

  #getItemFromEvent(event: Event) {
    const item = (event.target as HTMLElement).closest<MenuItem>(
      '[seele-base=menuitem]'
    );
    if (!item || !this.$items.includes(item)) return null;
    return { item, index: this.$items.indexOf(item) };
  }

  // Submenu items open their submenu instead of activating, for every
  // trigger (Enter, Space, ArrowRight, mouse click).
  #activateOrOpen(item: MenuItem, index: number) {
    if (item.hasSubmenu) {
      item.openSubmenu();
      return;
    }
    item.blur();
    this.#dispatchAction({ item, index });
    if (!this.keepOpenAction) this.#dispatchHide();
  }

  #dispatchAction(detail: MenuEventDetail) {
    this.dispatchEvent(
      new CustomEvent('action', {
        detail: detail,
        bubbles: true,
        composed: true,
      })
    );
  }
  #dispatchHide() {
    this.dispatchEvent(
      new Event('request-popup-hide', { bubbles: true, composed: true })
    );
  }
}

// Might as well be used in listbox, so let's keep it for now
// Reference: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
export enum MenuAction {
  Close = -11,
  CloseSelect = -10,
  First = 1,
  Last,
  Next,
  Open,
  PageDown,
  PageUp,
  Previous,
  Select,
  Type,
}

export function getActionFromKey(event: KeyboardEvent): MenuAction | null {
  const { key, altKey, ctrlKey, metaKey } = event;

  if (key === 'Escape') return MenuAction.Close;
  if (key === 'Enter' || key === ' ') return MenuAction.CloseSelect;

  if (key === 'Home') return MenuAction.First;
  if (key === 'End') return MenuAction.Last;
  if (key === 'PageUp') return MenuAction.PageUp;
  if (key === 'PageDown') return MenuAction.PageDown;

  if (key === 'ArrowRight') return MenuAction.Open;

  if (key === 'ArrowUp' && altKey) return MenuAction.CloseSelect;
  if (key === 'ArrowDown' && !altKey) return MenuAction.Next;
  if (key === 'ArrowUp' && !altKey) return MenuAction.Previous;

  if (
    key === 'Backspace' ||
    key === 'Clear' ||
    (key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey)
  ) {
    return MenuAction.Type;
  }

  return null;
}

export function getVisibleItems(container: HTMLElement, items: HTMLElement[]) {
  if (!items.length) return { first: 0, last: 0, pageSize: 1 };

  const containerRect = container.getBoundingClientRect();
  const style = window.getComputedStyle(container);

  const paddingTop = parseFloat(style.scrollPaddingTop) || 0;
  const paddingBottom = parseFloat(style.scrollPaddingBottom) || 0;
  const top = containerRect.top + container.clientTop + paddingTop;
  const bottom = top + container.clientHeight - paddingTop - paddingBottom;

  let first = -1;
  let last = -1;

  for (let i = 0; i < items.length; i++) {
    const itemRect = items[i].getBoundingClientRect();

    if (itemRect.top < bottom && itemRect.bottom > top) {
      if (first === -1) first = i;
      last = i;
    } else if (first !== -1) {
      break;
    }
  }

  if (first === -1) {
    return { first: 0, last: 0, pageSize: 1 };
  }

  // pageSize is the span of visible items
  return { first, last, pageSize: Math.max(1, last - first + 1) };
}
