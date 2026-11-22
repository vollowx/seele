import { LitElement, isServer } from 'lit';
import { property, state } from 'lit/decorators.js';
import { Option } from '../option.js';
import type { FormAssociatedInterface } from './form-associated.js';
import { internals, InternalsAttachedInterface } from './internals-attached.js';

export declare class SelectAPIInterface {
  required: boolean;
  multiple: boolean;
  value: string;
  selectedIndex: number;
  get $allItems(): Option[];
  readonly $selectedItems: Option[];

  select(value: string): void;
  selectIndex(index: number): void;
  reset(): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: string | File | FormData | null): void;

  readonly _disabled: boolean;
  _managesDefaultSelection(): boolean;
  _selectionChanged(): void;
  _reconcileSelection(): void;
  _selectionSet(): void;
  _syncSelection(): void;
}

export const SelectAPIMixin = <
  T extends Constructor<
    LitElement & InternalsAttachedInterface & FormAssociatedInterface
  >,
>(
  superClass: T
) => {
  class SelectAPIElement extends superClass {
    @property({ type: Boolean, noAccessor: true })
    get required() {
      return this.hasAttribute('required');
    }
    set required(value: boolean) {
      this.toggleAttribute('required', value);
    }

    @property({ type: Boolean, noAccessor: true })
    get multiple() {
      return this.hasAttribute('multiple');
    }
    set multiple(value: boolean) {
      this.toggleAttribute('multiple', value);
    }

    get $allItems(): Option[] {
      throw new Error('SelectAPIMixin requires an option collection.');
    }

    get $selectedItems() {
      return this.$allItems.filter((option) => option.selected);
    }

    @property()
    get value() {
      return this.$allItems.find((option) => option.selected)?.value ?? '';
    }
    set value(value: string) {
      this.select(value);
    }

    @property({ type: Number, attribute: 'selected-index' })
    get selectedIndex() {
      return this.$allItems.findIndex((option) => option.selected);
    }
    set selectedIndex(index: number) {
      this.selectIndex(index);
    }

    @state() private formDisabled = false;

    private pending: string | number | FormData | null = null;
    private explicitlyDeselected = false;
    private observer?: MutationObserver;
    private previousValue = '';
    private previousIndex = -1;

    select(value: string) {
      if (!this.$allItems.length) {
        this.pending = value;
        return;
      }
      this.pending = null;
      this.#replace(
        this.$allItems.find((option) => option.value === value) ?? null
      );
    }

    selectIndex(index: number) {
      if (!this.$allItems.length) {
        this.pending = index;
        return;
      }
      this.pending = null;
      this.#replace(this.$allItems[index] ?? null);
    }

    reset() {
      this.pending = null;
      this.explicitlyDeselected = false;
      for (const option of this.$allItems) option.resetSelection();
      this._reconcileSelection();
    }

    override attributeChangedCallback(
      name: string,
      old: string | null,
      value: string | null
    ) {
      super.attributeChangedCallback(name, old, value);
      if (old === value) return;
      if (name === 'required' || name === 'multiple') {
        this.requestUpdate(name, old !== null);
        this._reconcileSelection();
      } else if (name === 'name') {
        this._syncSelection();
      }
    }

    override connectedCallback() {
      super.connectedCallback();
      if (isServer) return;
      this.addEventListener(
        'seele-selection-change',
        this.#handleSelectionChange
      );
      this.observer = new MutationObserver(() => this._reconcileSelection());
      this.observer.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          'disabled',
          'selected',
          'value',
          'hidden',
          'seele-base',
        ],
      });
      this._reconcileSelection();
    }

    override disconnectedCallback() {
      this.removeEventListener(
        'seele-selection-change',
        this.#handleSelectionChange
      );
      this.observer?.disconnect();
      super.disconnectedCallback();
    }

    formResetCallback() {
      this.reset();
    }
    override formDisabledCallback(disabled: boolean) {
      this.formDisabled = disabled;
    }

    formStateRestoreCallback(state: string | File | FormData | null) {
      if (typeof state === 'string') this.select(state);
      else if (state instanceof FormData && this.multiple) {
        if (!this.$allItems.length) {
          this.pending = state;
          return;
        }
        const values = state
          .getAll('value')
          .filter((value): value is string => typeof value === 'string');
        for (const option of this.$allItems) {
          const index = values.indexOf(option.value);
          option.selected = index !== -1;
          if (index !== -1) values.splice(index, 1);
        }
        this.explicitlyDeselected = !this.$allItems.some(
          (option) => option.selected
        );
        this._syncSelection();
      }
    }

    get _disabled() {
      return this.disabled || this.formDisabled;
    }

    _managesDefaultSelection() {
      return true;
    }
    _selectionChanged() {}

    _reconcileSelection() {
      const options = this.$allItems;
      if (options.length && this.pending !== null) {
        const pending = this.pending;
        this.pending = null;
        if (typeof pending === 'string') this.select(pending);
        else if (typeof pending === 'number') this.selectIndex(pending);
        else this.formStateRestoreCallback(pending);
        return;
      }
      if (!this.multiple && this._managesDefaultSelection()) {
        const selected = options.filter((option) => option.selected);
        if (selected.length > 1) {
          const last = selected[selected.length - 1];
          for (const option of options)
            option.setDefaultSelection(option === last);
        } else if (!selected.length && !this.explicitlyDeselected) {
          options.find((option) => !option.disabled)?.setDefaultSelection(true);
        }
      }
      this._syncSelection();
    }

    _selectionSet() {
      this.pending = null;
      this.explicitlyDeselected = !this.$allItems.some(
        (option) => option.selected
      );
      this._syncSelection();
    }

    _syncSelection() {
      const options = this.$allItems;
      const selected = options.filter((option) => option.selected);
      const enabled = selected.filter((option) => !option.disabled);
      const selectedValue = selected[0]?.value ?? '';
      const selectedIndex = options.indexOf(selected[0]);

      if (this.multiple) {
        const value = new FormData();
        const state = new FormData();
        for (const option of enabled)
          if (this.name) value.append(this.name, option.value);
        for (const option of selected) state.append('value', option.value);
        this[internals].setFormValue(
          enabled.length && this.name ? value : null,
          state
        );
      } else {
        const option = selected[0];
        this[internals].setFormValue(
          option && !option.disabled ? selectedValue : null,
          selectedValue
        );
      }

      const missing =
        this.required &&
        (!selected.length ||
          (!this.multiple &&
            selected[0] === options[0] &&
            selected[0].value === ''));
      if (missing)
        this[internals].setValidity(
          { valueMissing: true },
          'Please select an item.'
        );
      else this[internals].setValidity({});

      if (this.previousValue !== selectedValue) {
        const previous = this.previousValue;
        this.previousValue = selectedValue;
        this.requestUpdate('value', previous);
      }
      if (this.previousIndex !== selectedIndex) {
        const previous = this.previousIndex;
        this.previousIndex = selectedIndex;
        this.requestUpdate('selectedIndex', previous);
      }
      this._selectionChanged();
    }

    #handleSelectionChange = (event: Event) => {
      const option = event.target;
      if (!(option instanceof Option) || !this.$allItems.includes(option))
        return;
      if (option.selected && !this.multiple && this._managesDefaultSelection())
        this.#replace(option);
      else {
        this.explicitlyDeselected = !this.$allItems.some(
          (option) => option.selected
        );
        this._syncSelection();
      }
    };

    #replace(selected: Option | null) {
      this.explicitlyDeselected = !selected;
      for (const option of this.$allItems) {
        const next = option === selected;
        if (option.selected !== next) option.selected = next;
      }
      this._syncSelection();
    }
  }
  return SelectAPIElement as Constructor<SelectAPIInterface> & T;
};
