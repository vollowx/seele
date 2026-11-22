import { isServer } from 'lit';
import { property } from 'lit/decorators.js';

import { ListItem } from './listitem.js';
import { internals, updateInternals } from './mixins/internals-attached.js';

const selected = Symbol('selected');
const dirtySelected = Symbol('dirtySelected');

export class Option extends ListItem {
  override _role = 'option';

  declare private [selected]?: boolean;
  declare private [dirtySelected]?: boolean;

  @property({ type: Boolean, attribute: false })
  get selected() {
    return this[selected] ?? false;
  }
  set selected(value: boolean) {
    const changed = this.selected !== value;
    this[selected] = value;
    this[dirtySelected] = true;
    if (changed && !isServer && this.isConnected) {
      queueMicrotask(() => {
        this.dispatchEvent(
          new Event('seele-selection-change', { bubbles: true })
        );
      });
    }
  }

  @property({ type: Boolean, reflect: true, attribute: 'selected' })
  defaultSelected = false;

  protected override updated(changed: Map<string, any>) {
    super.updated(changed);
    if (changed.has('selected')) this[updateInternals]();
  }

  override [updateInternals]() {
    super[updateInternals]();
    this[internals].ariaSelected = this.selected ? 'true' : 'false';
    this.selected
      ? this[internals].states.add('selected')
      : this[internals].states.delete('selected');
  }

  override attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null
  ) {
    super.attributeChangedCallback(name, old, value);
    if (name === 'selected' && !this[dirtySelected]) {
      this.setDefaultSelection(value !== null);
    }
  }

  override formDisabledCallback(_disabled: boolean) {
    // Fieldset disabling must not change the option's own disabled attribute.
  }

  resetSelection() {
    this[dirtySelected] = false;
    this.setDefaultSelection(this.hasAttribute('selected'));
  }

  setDefaultSelection(value: boolean) {
    const previous = this.selected;
    this[selected] = value;
    this.requestUpdate('selected', previous);
  }

  @property({ noAccessor: true })
  get value(): string {
    return this.getAttribute('value') ?? this.textContent?.trim() ?? '';
  }
  set value(value: string) {
    this.setAttribute('value', value);
  }
}
