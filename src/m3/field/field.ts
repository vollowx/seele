import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { fieldStyles } from './field-styles.css.js';

export abstract class M3Field extends LitElement {
  @property({ type: String, reflect: true }) label = '';
  @property({ type: String, reflect: true, attribute: 'supporting-text' })
  supportingText = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: Boolean, reflect: true }) focused = false;
  @property({ type: Boolean, reflect: true }) populated = false;

  @property({ type: Boolean, reflect: true, attribute: 'has-label' })
  hasLabel = false;

  @state() hasStart = false;
  @state() hasEnd = false;

  @query('slot[name=start]') $start!: HTMLSlotElement | null;
  @query('slot[name=end]') $end!: HTMLSlotElement | null;

  static override styles = [fieldStyles];

  override render() {
    return html`
      <div class="container">${this.renderContainerContent()}</div>
      ${this.renderSupportingText()}
    `;
  }

  /**
   * Should be implemented by subclasses.
   */
  abstract renderContainerContent(): TemplateResult;

  renderSupportingText() {
    if (!this.supportingText) {
      return '';
    }

    return html`<div class="supporting-text">${this.supportingText}</div>`;
  }

  renderStart() {
    return html`<slot
      name="start"
      class="start"
      ?hidden=${!this.hasStart}
      @slotchange=${this.#handleSlotChange}
    ></slot>`;
  }

  renderEnd() {
    return html`<slot
      name="end"
      class="end"
      ?hidden=${!this.hasEnd}
      @slotchange=${this.#handleSlotChange}
    ></slot>`;
  }

  override update(changedProperties: PropertyValues) {
    if (changedProperties.has('label')) {
      this.hasLabel = !!this.label;
    }
    super.update(changedProperties);
  }

  override async firstUpdated() {
    await this.updateComplete;
    if (!this.isConnected) return;
    this.#updateSlotStatus(this.$start);
    this.#updateSlotStatus(this.$end);
  }

  #handleSlotChange(e: Event) {
    this.#updateSlotStatus(e.target as HTMLSlotElement);
  }

  #updateSlotStatus(slot: HTMLSlotElement | null) {
    if (!slot) return;
    const hasContent = slot.assignedNodes({ flatten: true }).length > 0;
    if (slot.name === 'start') this.hasStart = hasContent;
    if (slot.name === 'end') this.hasEnd = hasContent;
  }
}
