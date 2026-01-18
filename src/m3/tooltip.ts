import { customElement } from 'lit/decorators.js';

import { Tooltip } from '../base/tooltip.js';

import { tooltipStyles } from './tooltip-styles.css.js';

/**
 * @tag md-tooltip
 */
@customElement('md-tooltip')
export class M3Tooltip extends Tooltip {
  override readonly _durations = { show: 150, hide: 150 };

  static override styles = [tooltipStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tooltip': M3Tooltip;
  }
}
