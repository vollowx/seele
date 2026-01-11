import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Input } from '../base/input.js';

@customElement('md-text-field')
export class M3TextField extends Input {
  static override styles = css`
    :host {
      display: inline-block;
      border: 1px solid #ccc;
      padding: 4px;
    }
    .input {
      border: none;
      outline: none;
      width: 100%;
      background: transparent;
      font: inherit;
    }
  `;
}
