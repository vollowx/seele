import { html } from 'lit';
import { query, state, customElement } from 'lit/decorators.js';
import { ensureSlottedReady } from '../../core/ensure-ready.js';
import { Dialog } from '../../base/dialog.js';
import { dialogStyles } from './dialog-styles.css.js';

/**
 * TODO: test if form actions `cancel` and other things related work - no,
 *       event listener needed
 * FIXME: on Firefox, the focus is not autoatically set to the first tabbable
 *        element
 *
 * @tag md-dialog
 *
 * @csspart container
 * @csspart headline
 * @csspart content
 * @csspart actions
 *
 * @slot icon
 * @slot headline
 * @slot - content
 * @slot actions
 */
@customElement('md-dialog')
export class M3Dialog extends Dialog {
  // Was based on https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration#e5b958f0-435d-4e84-aed4-8d1ea395fa5c
  // TODO: use curves and durations from motion physics
  _config = {
    openEase: 'cubic-bezier(0, 0, 0, 1)',
    closeEase: 'cubic-bezier(0.3, 0, 1, 1)',
    vertSlide: 40,
    openDur: 500,
    closeDur: 200,
    bodyFadeInDur: 200,
    bodyFadeOutDur: 100,
  };

  @state() private hasIcon = false;
  @query('[part=container]') $container!: HTMLDivElement | null;
  @query('[part=body]') $body!: HTMLDivElement | null;
  @query('[name=icon]') $icon!: HTMLSlotElement | null;
  @query('[part=actions]') $actions!: HTMLDivElement | null;
  @query('.actions-placeholder') $actionsPlaceholder!: HTMLDivElement | null;
  @query('[part=scrim]') $scrim!: HTMLDivElement | null;

  static override styles = [dialogStyles];
  override render() {
    return html`
      <dialog
        part="dialog"
        @click="${this.#handleClick}"
        @cancel="${this._handleCancel}"
      >
        <div part="container">
          <div part="body">
            <div part="headline" class=${this.hasIcon ? 'has-icon' : ''}>
              <slot
                name="icon"
                @slotchange="${this.#handleIconSlotChange}"
              ></slot>
              <slot name="headline"></slot>
            </div>
            <div part="content">
              <slot></slot>
            </div>
            <div class="actions-placeholder"></div>
          </div>
          <div part="actions">
            <slot name="actions"></slot>
          </div>
        </div>
      </dialog>
      <div part="scrim"></div>
    `;
  }

  override async firstUpdated() {
    await ensureSlottedReady(this);
    this.#handleIconSlotChange();
  }

  #activeAnimations: Animation[] = [];
  #clearAnimations() {
    this.#activeAnimations.forEach((anim) => anim.cancel());
    this.#activeAnimations = [];
    this.#opening = this.#closing = false;
  }

  #handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!this.$container!.contains(target) && !this.contains(target))
      this.close();
  };
  #handleIconSlotChange = () => {
    this.hasIcon = this.$icon!.assignedElements({ flatten: true }).length > 0;
  };

  #opening = false;
  override async show() {
    if (this.#opening) return;
    await this.updateComplete;

    this.#clearAnimations();
    this.#opening = true;

    // Reset margins to allow browser centering
    this.$dialog!.style.marginTop = 'auto';
    this.$dialog!.style.marginBottom = 'auto';

    super.show();

    const actionsHeight = this.$actions!.offsetHeight;
    this.$actionsPlaceholder!.style.height = `${actionsHeight}px`;

    this.$container!.style.height = 'auto';
    const startHeight = 0;
    const endHeight = this.$container!.offsetHeight;

    // Lock the position to prevent auto-centering during animation
    const rect = this.$container!.getBoundingClientRect();
    this.$dialog!.style.marginTop = `${rect.top}px`;
    this.$dialog!.style.marginBottom = 'auto';

    this.$container!.style.minHeight = '0px';
    const container = this.$container!.animate(
      [
        {
          height: `${startHeight}px`,
          transform: `translateY(-${this._config.vertSlide}px)`,
        },
        {
          height: `${endHeight}px`,
          transform: 'translateY(0px)',
        },
      ],
      { duration: this._config.openDur, easing: this._config.openEase }
    );

    const scrim = this.$scrim!.animate([{ opacity: 0 }, { opacity: 0.32 }], {
      duration: this._config.openDur,
      easing: this._config.openEase,
      fill: 'forwards',
    });

    const body = this.$body!.animate([{ opacity: 0.2 }, { opacity: 1 }], {
      duration: this._config.bodyFadeInDur,
      easing: 'linear',
      fill: 'forwards',
    });

    const actions = this.$actions!.animate([{ opacity: 0.5 }, { opacity: 1 }], {
      duration: this._config.bodyFadeInDur,
      easing: 'linear',
      fill: 'forwards',
    });

    this.#activeAnimations.push(container, scrim, body, actions);

    container.onfinish = () => {
      this.$container!.style.minHeight = '';
      this.#clearAnimations();
    };
  }

  #closing = false;
  override async close() {
    if (this.#closing) return;
    await this.updateComplete;
    this.#clearAnimations();
    this.#closing = true;

    const startHeight = this.$container!.offsetHeight;
    const endHeight = startHeight * 0.35;

    this.$container!.style.minHeight = '0px';
    const containerSpatial = this.$container!.animate(
      [
        { height: `${startHeight}px`, transform: 'translateY(0px)' },
        {
          height: `${endHeight}px`,
          transform: `translateY(-${this._config.vertSlide}px)`,
        },
      ],
      {
        duration: this._config.closeDur,
        easing: this._config.closeEase,
      }
    );

    const containerEffects = this.$container!.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      {
        duration: this._config.closeDur - this._config.bodyFadeOutDur,
        delay: this._config.bodyFadeOutDur,
        easing: 'linear',
        fill: 'forwards',
      }
    );

    const scrim = this.$scrim!.animate([{ opacity: 0.32 }, { opacity: 0 }], {
      duration: this._config.closeDur,
      easing: this._config.closeEase,
      fill: 'forwards',
    });

    const body = this.$body!.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: this._config.bodyFadeOutDur,
      easing: 'linear',
      fill: 'forwards',
    });

    const actions = this.$actions!.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: this._config.bodyFadeOutDur,
      easing: 'linear',
      fill: 'forwards',
    });

    this.#activeAnimations.push(
      containerSpatial,
      containerEffects,
      scrim,
      body,
      actions
    );

    containerSpatial.onfinish = () => {
      this.$container!.style.minHeight = '';
      super.close();
      this.#clearAnimations();
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-dialog': M3Dialog;
  }
}
