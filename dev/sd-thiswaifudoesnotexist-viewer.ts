import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../src/m3/button/icon-button.js';
import '../src/m3/toolbar/toolbar.js';
import '../src/m3/tooltip/tooltip.js';

@customElement('sd-thiswaifudoesnotexist-viewer')
export class ThisWaifuDoesNotExist extends LitElement {
  static override styles = [
    css`
      :host {
        border-radius: 36px;
        display: block;
        height: 360px;
        position: relative;
        -webkit-user-select: none;
        user-select: none;
        width: 360px;
      }
      .image {
        border-radius: inherit;
        height: 100%;
        width: 100%;
      }
      .nth {
        background-color: var(--md-sys-color-primary-container);
        border-radius: 9999px;
        color: var(--md-sys-color-on-primary-container);
        font: var(--md-sys-typography-label-large);
        display: flex;
        gap: 8px;
        left: 18px;
        padding: 8px 12px;
        position: absolute;
        top: 18px;
      }
      #control {
        bottom: 8px;
        position: absolute;
        right: 8px;
      }

      md-icon {
        display: inline-block;
        font-family: 'Material Symbols Rounded';
        font-style: normal;
        font-weight: normal;
        font-variation-settings: var(--_icon-font-config);
        letter-spacing: normal;
        line-height: 1;
        text-transform: none;
        white-space: nowrap;
        word-wrap: normal;
      }
    `,
  ];
  override render() {
    return html`
      <img
        class="image"
        src="https://www.thiswaifudoesnotexist.net/example-${this.nth}.jpg"
        @load="${this.handleLoad}"
      />

      <div class="nth">${this.nth}</div>

      <md-toolbar id="control" type="floating">
        <md-icon-button
          id="random"
          @click="${() => this.loadImage(Math.floor(Math.random() * 100000))}"
          .disabled="${this.loading}"
          ><md-icon>shuffle</md-icon></md-icon-button
        >
        <md-tooltip for="random">Random</md-tooltip>
        <md-icon-button
          id="prev"
          @click="${() => this.loadImage(this.nth - 1)}"
          .disabled="${this.loading}"
          ><md-icon>arrow_back</md-icon></md-icon-button
        >
        <md-tooltip for="prev">Previous</md-tooltip>
        <md-icon-button
          id="next"
          @click="${() => this.loadImage(this.nth + 1)}"
          .disabled="${this.loading}"
          ><md-icon>arrow_forward</md-icon></md-icon-button
        >
        <md-tooltip for="next">Next</md-tooltip>
      </md-toolbar>
    `;
  }

  @property({ type: Boolean }) loading = true;
  @property({ type: Number }) nth = 50000;

  private handleLoad() {
    this.loading = false;
  }

  loadImage(nth: number) {
    this.loading = true;
    if (nth > 100000) nth = 100000;
    if (nth < 0) nth = 0;
    if (nth === this.nth) return;
    this.nth = nth;
  }
}

// Lord what am I doing
declare global {
  interface HTMLElementTagNameMap {
    'sd-thiswaifudoesnotexist-viewer': ThisWaifuDoesNotExist;
  }
}
