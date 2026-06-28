import { LitElement, html, isServer } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import { internals } from './mixins/internals-attached.js';
import type { Tab } from './tab.js';
import type { TabPanel } from './tab-panel.js';

/**
 * @fires {CustomEvent} tab-select
 */
export class Tabs extends LitElement {
  @property({ type: String }) switch: 'auto' | 'manual' = 'manual';
  @property({ type: String, reflect: true }) selected = '';

  @queryAssignedElements({ flatten: true }) $slotItems!: Array<HTMLElement>;

  protected _role: string = 'tablist';

  get $tabs(): Tab[] {
    return this.$slotItems.filter(item => item[internals].role === 'tab') as Tab[];
  }
  get $parent(): HTMLElement {
    return this.parentNode instanceof ShadowRoot
        ? ((this.parentNode as ShadowRoot).host as HTMLElement)
        : this.parentElement;
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.addEventListener('keydown', this.#handleKeyDown.bind(this));
      this.addEventListener('click', this.#handleClick.bind(this));
    }
  }

  protected override updated(changed: Map<string, any>) {
    if (changed.has('selected') && this.selected) {
       const targetTab = this.$tabs.find(t => t.value === this.selected);
       if (targetTab && !targetTab.selected) {
         this.selectTab(targetTab);
       }
    }
  }

  #handleSlotChange(_: Event) {
    const parent = this.$parent;
    this.$tabs.forEach(tab => {
      const panel = parent.querySelector(`[seele-base="tab"][value="${tab.value}"]`) as TabPanel;
      if (!panel) console.error('[seele] cannot find a matching panel for tab ', tab);
      // TODO: ariaLabelledByElements
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', tab.id);
    });
  }

  #handleKeyDown(event: KeyboardEvent) {
    const tabs = this.$tabs;
    if (!tabs.length) return;

    const activeElement = (this.getRootNode() as Document | ShadowRoot).activeElement;
    const currentIndex = tabs.findIndex(t => t === activeElement || t.focused);
    let nextIndex = currentIndex !== -1 ? currentIndex : 0;

    let handled = false;

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
        handled = true;
        break;
      case 'ArrowRight':
        nextIndex = currentIndex >= tabs.length - 1 ? 0 : currentIndex + 1;
        handled = true;
        break;
      case 'Home':
        nextIndex = 0;
        handled = true;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        handled = true;
        break;
      case 'Enter':
      case ' ':
        if (currentIndex !== -1) {
           this.selectTab(tabs[currentIndex]);
        }
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();

      if (event.key !== 'Enter' && event.key !== ' ') {
        this.focusTab(tabs[nextIndex]);
        if (this.switch === 'auto')
          this.selectTab(tabs[nextIndex]);
      }
    }
  };

  #handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tab = target.closest('md-tab') as Tab;

    if (tab && this.$tabs.includes(tab)) {
      this.focusTab(tab);
      this.selectTab(tab);
    }
  };

  focusTab(tab: Tab) {
    this.$tabs.forEach(t => {
      t.blur();
      t.tabIndex = -1;
    });
    tab.tabIndex = 0;
    tab.focus();
  }

  selectTab(selectedTab: Tab) {
    this.selected = selectedTab.value;
    const parent = this.$parent;
    const panels = Array.from(parent.querySelectorAll('[seele-base="tabpanel"]')) as TabPanel[];

    this.$tabs.forEach(tab => {
      tab.selected = (tab === selectedTab);
      tab.tabIndex = (tab === selectedTab) ? 0 : -1;
    });
    panels.forEach(panel => {
      if (panel.value && selectedTab.value) {
        panel.hidden = panel.value !== selectedTab.value;
      }
    });

    this.dispatchEvent(new CustomEvent('tab-select', {
      detail: { tab: selectedTab, value: this.selected },
      bubbles: true,
      composed: true
    }));
  }

  override render() {
    return html`
      <div part="tablist" role="tablist">
        <slot @slotchange=${this.#handleSlotChange}></slot>
      </div>
    `;
  }
}
