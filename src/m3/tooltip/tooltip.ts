import { customElement } from '../../core/decorators.js';
import { Tooltip } from '../../base/tooltip.js';

import { tooltipStyles } from './tooltip-styles.css.js';

/**
 * @tag md-tooltip
 *
 * TODO: should not disable SSR, since the raw text would flash, but could try
 * to SSR a simpler one
 */
@customElement('md-tooltip', true)
export class M3Tooltip extends Tooltip {
  override readonly _durations = { show: 150, hide: 150 };

  static override styles = [tooltipStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tooltip': M3Tooltip;
  }
}
