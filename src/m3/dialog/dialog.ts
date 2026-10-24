import { html } from 'lit';
import { query, state, customElement } from 'lit/decorators.js';

import { ensureSlottedReady } from '../../core/ensure-ready.js';
import { Dialog } from '../../base/dialog.js';

import { getSpring } from '../styles/motion.js';
import { dialogStyles } from './dialog-styles.css.js';

// Was based on https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration#e5b958f0-435d-4e84-aed4-8d1ea395fa5c
// TODO: use curves and durations from motion physics
const options = {
  openEase: 'cubic-bezier(0, 0, 0, 1)',
  closeEase: 'cubic-bezier(0.3, 0, 1, 1)',
  vertSlide: 40,
  openDur: 500,
  closeDur: 200,
  bodyFadeInDur: 200,
  bodyFadeOutDur: 100,
};

type AnimationPart = 'container' | 'effects' | 'scrim' | 'body' | 'actions';
type AnimationRecipe = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
};
type DialogAnimations = {
  open: Partial<Record<AnimationPart, AnimationRecipe>>;
  close: Partial<Record<AnimationPart, AnimationRecipe>>;
};

const opacity = (
  from: string,
  to: string,
  options: KeyframeAnimationOptions
): AnimationRecipe => ({
  keyframes: [{ opacity: from }, { opacity: to }],
  options,
});

export const getFadeAnimations = (host: M3Dialog): DialogAnimations => {
  const effectsFast = getSpring(host, 'effects', 'fast');
  const fade = (from: string, to: string) =>
    opacity(from, to, { ...effectsFast, fill: 'forwards' });
  const container = getComputedStyle(host.$container!),
    scrim = getComputedStyle(host.$scrim!);

  return {
    open: {
      container: fade('0', '1'),
      scrim: fade('0', '0.32'),
    },
    close: {
      container: fade(container.opacity, '0'),
      scrim: fade(scrim.opacity, '0'),
    },
  };
};

export const getDefaultAnimations = (host: M3Dialog): DialogAnimations => {
  const container = getComputedStyle(host.$container!),
    scrim = getComputedStyle(host.$scrim!),
    body = getComputedStyle(host.$body!),
    actions = getComputedStyle(host.$actions!);

  return {
    open: {
      container: {
        keyframes: [
          {
            height: '0px',
            minHeight: '0px',
            transform: `translateY(-${options.vertSlide}px)`,
          },
          {
            height: `${host._fullHeight}px`,
            minHeight: '0px',
            transform: 'translateY(0px)',
          },
        ],
        options: { duration: options.openDur, easing: options.openEase },
      },
      scrim: opacity('0', '0.32', {
        duration: options.openDur,
        easing: options.openEase,
        fill: 'forwards',
      }),
      body: opacity('0.2', '1', {
        duration: options.bodyFadeInDur,
        fill: 'forwards',
      }),
      actions: opacity('0.5', '1', {
        duration: options.bodyFadeInDur,
        fill: 'forwards',
      }),
    },
    close: {
      container: {
        keyframes: [
          {
            height: container.height,
            minHeight: '0px',
            transform: container.transform,
          },
          {
            height: `${host._fullHeight * 0.35}px`,
            minHeight: '0px',
            transform: `translateY(-${options.vertSlide}px)`,
          },
        ],
        options: { duration: options.closeDur, easing: options.closeEase },
      },
      effects: opacity(container.opacity, '0', {
        duration: options.closeDur - options.bodyFadeOutDur,
        delay: options.bodyFadeOutDur,
        fill: 'forwards',
      }),
      scrim: opacity(scrim.opacity, '0', {
        duration: options.closeDur,
        easing: options.closeEase,
        fill: 'forwards',
      }),
      body: opacity(body.opacity, '0', {
        duration: options.bodyFadeOutDur,
        fill: 'forwards',
      }),
      actions: opacity(actions.opacity, '0', {
        duration: options.bodyFadeOutDur,
        fill: 'forwards',
      }),
    },
  };
};

/**
 * TODO: test if form actions `cancel` and other things related work - no,
 *       event listener needed
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

  _fullHeight = 0;
  #animate(recipes: Partial<Record<AnimationPart, AnimationRecipe>>) {
    const targets: Record<AnimationPart, HTMLElement> = {
      container: this.$container!,
      effects: this.$container!,
      scrim: this.$scrim!,
      body: this.$body!,
      actions: this.$actions!,
    };

    const animations: Record<string, Animation> = {};
    for (const [name, recipe] of Object.entries(recipes) as [
      AnimationPart,
      AnimationRecipe,
    ][]) {
      animations[name] = targets[name].animate(
        recipe.keyframes,
        recipe.options
      );
      this.#activeAnimations.push(animations[name]);
    }
    return animations;
  }

  get #fade() {
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      getComputedStyle(this)
        .getPropertyValue('--md-dialog-animation')
        .trim() === 'fade'
    );
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

    await super.show();

    const actionsHeight = this.$actions!.offsetHeight;
    this.$actionsPlaceholder!.style.height = `${actionsHeight}px`;

    this.$container!.style.height = 'auto';
    this._fullHeight = this.$container!.offsetHeight;

    // Lock the position to prevent auto-centering during animation
    const rect = this.$container!.getBoundingClientRect();
    this.$dialog!.style.marginTop = `${rect.top}px`;
    this.$dialog!.style.marginBottom = 'auto';

    const getAnimations = this.#fade ? getFadeAnimations : getDefaultAnimations;
    const animations = this.#animate(getAnimations(this).open);

    animations.container.onfinish = () => this.#clearAnimations();
  }

  #closing = false;
  override async close() {
    if (this.#closing) return;
    await this.updateComplete;

    const getAnimations = this.#fade ? getFadeAnimations : getDefaultAnimations;
    const recipes = getAnimations(this).close;

    this.#clearAnimations();
    this.#closing = true;

    const animations = this.#animate(recipes);

    animations.container.onfinish = async () => {
      await super.close();
      this.#clearAnimations();
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-dialog': M3Dialog;
  }
}
