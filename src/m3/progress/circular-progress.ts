import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { customElement } from '../../core/decorators.js';
import { ProgressBar } from '../../base/progressbar.js';

import { circularProgressStyles } from './circular-progress-styles.css.js';

/**
 * TODO: wavy?
 *
 * @tag md-circular-progress
 *
 * @csspart container
 * @csspart track
 * @csspart active
 */
@customElement('md-circular-progress')
export class M3CircularProgress extends ProgressBar {
  static override styles = [circularProgressStyles];
  override render() {
    const progress = Math.min(Math.max(this.value, 0), 100);
    const style = {
      '--_value': `${progress === 100 ? 1.08 : (progress) / 100}`,
    };

    return html`
      <div part="container" style=${styleMap(style)}>
        <svg xmlns="http://www.w3.org/2000/svg">
          <circle part="track"></circle>
          <circle part="active"></circle>
        </svg>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-circular-progress': M3CircularProgress;
  }
}
