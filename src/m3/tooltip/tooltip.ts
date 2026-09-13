import { customElement } from '../../core/decorators.js';
import { Tooltip } from '../../base/tooltip.js';

import { tooltipStyles } from './tooltip-styles.css.js';

/**
 * @tag md-tooltip
 */
@customElement('md-tooltip', true)
export class M3Tooltip extends Tooltip {
  static override styles = [tooltipStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tooltip': M3Tooltip;
  }
}
