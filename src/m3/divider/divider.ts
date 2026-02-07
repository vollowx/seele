import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { dividerStyles } from './divider-styles.css.js';

@customElement('md-divider')
export class M3Divider extends LitElement {
  static override styles = [dividerStyles];
  @property({ type: Boolean, reflect: false })
  vertical = false;
  @property({ type: Boolean, reflect: false })
  inset = false;
  @property({ type: Boolean, reflect: false, attribute: 'inset-start' })
  insetStart = false;
  @property({ type: Boolean, reflect: false, attribute: 'inset-end' })
  insetEnd = false;
}
