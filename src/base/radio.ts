import { isServer, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { FormAssociated } from './mixins/form-associated.js';
import {
  InternalsAttached,
  internals,
  replaceStates,
  updateInternals,
} from './mixins/internals-attached.js';

export class Radio extends FormAssociated(InternalsAttached(LitElement)) {
  // Static hidden registry: Scope (Form or RootNode) -> Name -> Set<Radio>
  static #registry = new Map<Node, Map<string, Set<Radio>>>();
  #currentScope: Node | null = null;
  #currentName = '';

  @property({ type: String }) value!: string;
  @property({ type: Boolean }) checked = false;

  constructor() {
    super();
    this[internals].role = 'radio';
    if (!isServer) {
      this.addEventListener('click', this.#handleClick);
      this.addEventListener('keydown', this.#handleKeyDown);
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#registerToGroup();
    this[updateInternals]();
  }

  override disconnectedCallback(): void {
    this.#unregisterFromGroup();
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    if (changedProperties.has('name')) {
      this.#unregisterFromGroup();
      this.#registerToGroup();
    }

    if (changedProperties.has('checked')) {
      if (this.checked) {
        this.#uncheckSiblings();
      }
      this[internals].setFormValue(this.checked ? this.value : null);
      this.#updateGroupTabIndices();
    }

    if (changedProperties.has('disabled') || changedProperties.has('checked'))
      this[updateInternals]();
  }

  #handleClick(): void {
    if (this.disabled || this.checked) return;
    this.checked = true;
    this.focus();
    this.#dispatchEvents();
  }

  #handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case ' ':
        event.preventDefault();
        if (!this.checked) {
          this.checked = true;
          this.#dispatchEvents();
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.#navigateGroup(1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.#navigateGroup(-1);
        break;
    }
  }

  #getScope(): Node {
    return (this.form as Node) ?? this.getRootNode();
  }

  #registerToGroup(): void {
    if (!this.name) return;

    const scope = this.#getScope();
    this.#currentScope = scope;
    this.#currentName = this.name;

    let scopeMap = Radio.#registry.get(scope);
    if (!scopeMap) {
      scopeMap = new Map<string, Set<Radio>>();
      Radio.#registry.set(scope, scopeMap);
    }

    let group = scopeMap.get(this.name);
    if (!group) {
      group = new Set<Radio>();
      scopeMap.set(this.name, group);
    }

    group.add(this);
    this.#updateGroupTabIndices(group);
  }

  #unregisterFromGroup(): void {
    if (!this.#currentScope || !this.#currentName) return;

    const scopeMap = Radio.#registry.get(this.#currentScope);
    if (scopeMap) {
      const group = scopeMap.get(this.#currentName);
      if (group) {
        group.delete(this);
        if (group.size === 0) {
          scopeMap.delete(this.#currentName);
        } else {
          this.#updateGroupTabIndices(group);
        }
      }
      if (scopeMap.size === 0) Radio.#registry.delete(this.#currentScope);
    }

    this.#currentScope = null;
    this.#currentName = '';
  }

  #getGroupRadios(): Iterable<Radio> {
    if (!this.#currentName || !this.#currentScope) return [this];
    return (
      Radio.#registry.get(this.#currentScope)?.get(this.#currentName) ?? [this]
    );
  }

  #uncheckSiblings(): void {
    const radios = this.#getGroupRadios();
    for (const radio of radios)
      if (radio !== this && radio.checked) radio.checked = false;
  }

  #updateGroupTabIndices(groupSet?: Iterable<Radio>): void {
    const radios = groupSet ?? this.#getGroupRadios();

    let hasChecked = false;
    for (const r of radios) {
      if (r.checked && !r.disabled) {
        hasChecked = true;
        break;
      }
    }

    let enabledFound = false;

    for (const radio of radios) {
      const active =
        !radio.disabled && (hasChecked ? radio.checked : !enabledFound);
      if (active) enabledFound = true;
      radio.tabIndex = active ? 0 : -1;
    }
  }

  #navigateGroup(direction: 1 | -1): void {
    const radios = Array.from(this.#getGroupRadios()).filter(
      (r) => !r.disabled
    );

    if (radios.length <= 1) return;

    const currentIndex = radios.indexOf(this);
    const nextIndex =
      (currentIndex + direction + radios.length) % radios.length;
    const targetRadio = radios[nextIndex];

    targetRadio.checked = true;
    targetRadio.focus();
  }

  override [updateInternals](): void {
    this[internals].ariaChecked = String(this.checked);
    this[internals].ariaDisabled = String(this.disabled);
    this[replaceStates](['checked'], [this.checked ? 'checked' : null]);
  }

  #dispatchEvents() {
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  formResetCallback(): void {
    this.checked = this.hasAttribute('checked');
  }

  formStateRestoreCallback(state: string | null): void {
    this.checked = state === this.value;
  }
}
