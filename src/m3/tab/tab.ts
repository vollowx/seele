import { html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

import { Tab } from '../../base/tab.js';
import { getSpring } from '../styles/motion.js';
import '../focus-ring/focus-ring.js';
import '../ripple/ripple.js';

import { targetStyles } from '../target-styles.css.js';
import { tabStyles } from './tab-styles.css.js';

const KEYFRAMES = 20;

/**
 * @tag md-tab
 *
 * @slot icon - icon
 * @slot - label
 */
@customElement('md-tab')
export class M3Tab extends Tab {
  @query('[part="indicator"]') $indicator!: HTMLElement | null;
  @state() protected _isSecondary = false;

  static override styles = [targetStyles, tabStyles];
  override render() {
    return html`
      <md-focus-ring inward></md-focus-ring>
      <md-ripple></md-ripple>
      <span part="target"></span>
      <div part="content">
        <slot part="icon" name="icon" aria-hidden="true"></slot>
        <slot part="label"></slot>
        ${!this._isSecondary ? html`<div part="indicator" role="presentation"></div>` : nothing}
      </div>
      ${this._isSecondary ? html`<div part="indicator" role="presentation"></div>` : nothing}
    `;
  }

  async animateIndicator(previousTab: M3Tab) {
    await this.updateComplete;
    const indicator = this.$indicator!;

    indicator.getAnimations().forEach((a) => a.cancel());
    const prevIndicator = previousTab.$indicator;
    if (
      prevIndicator &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const from = prevIndicator.getBoundingClientRect();
      const to = indicator.getBoundingClientRect();

      let keyframes: Keyframe[] = [];
      if (!this._isSecondary) {
        const startLeft = from.left - to.left;
        const startRight = from.right - to.left;
        const endLeft = 0;
        const endRight = to.width;
        const movingRight = startLeft < 0;

        for (let i = 0; i <= KEYFRAMES; i++) {
          const t = i / KEYFRAMES;
          const dec = Math.sin((t * Math.PI) / 2);
          const acc = 1 - Math.cos((t * Math.PI) / 2);
          const leftProgress = movingRight ? acc : dec;
          const rightProgress = movingRight ? dec : acc;

          const left = startLeft + (endLeft - startLeft) * leftProgress;
          const right = startRight + (endRight - startRight) * rightProgress;
          const width = right - left;
          const translateX = left.toFixed(4);
          const scaleX = (width / to.width).toFixed(4);

          keyframes.push({
            transform: `translateX(${translateX}px) scaleX(${scaleX})`,
          });
        }
      } else {
        const translateX = (from.left - to.left).toFixed(4);
        const scaleX = (from.width / to.width).toFixed(4);
        keyframes = [
          {
            transform: `translateX(${translateX}px) scaleX(${scaleX})`,
          },
          { transform: 'none' },
        ];
      }
      indicator.animate(keyframes, {
        ...getSpring(this, 'spatial', 'default'),
        fill: 'none',
      });
    } else {
      indicator.animate([{ opacity: '0' }, { opacity: '1' }], {
        ...getSpring(this, 'effects', 'default'),
        fill: 'none',
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-tab': M3Tab;
  }
}
