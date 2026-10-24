import { LitElement, html, isServer } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { customElement } from '../../core/decorators.js';
import { ensureSlottedReady } from '../../core/ensure-ready.js';
import { getSpring } from '../styles/motion.js';
import { standardButtonGroupStyles } from './standard-button-group-styles.css.js';

const EXPAND_FACTOR = 1.15;

const shapeAnimation = Symbol('shapeAnimation');
type ShapeAnimatedElement = HTMLElement & { [shapeAnimation]?: Animation };

/**
 * @tag md-button-group
 *
 * @slot - buttons
 */
@customElement('md-button-group')
export class M3StandardButtonGroup extends LitElement {
  @property({ reflect: true })
  size: 'xs' | 's' | '' = '';
  @queryAssignedElements()
  $buttons!: Array<ShapeAnimatedElement>;

  static override styles = [standardButtonGroupStyles];
  override render() {
    return html`<slot @slotchange="${this.#handleSlotChange}"></slot>`;
  }

  constructor() {
    super();
    if (!isServer) {
      this.addEventListener('pointerdown', this.#handlePointerDown);
      this.addEventListener('keydown', this.#handleKeyDown, { capture: true });
    }
  }
  override connectedCallback() {
    super.connectedCallback();

    const signal = (this.#abortController = new AbortController()).signal;
    window.addEventListener('pointerup', this.#reset, { signal });
    window.addEventListener('pointercancel', this.#reset, { signal });
    window.addEventListener('keyup', this.#reset, { capture: true, signal });

    this.#resizeObserver = new ResizeObserver((entries) => {
      const isAnimating =
        this.#activeIndex !== -1 ||
        this.$buttons.some((btn) => btn[shapeAnimation]);
      if (isAnimating) return; // Skip if animating

      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        const index = this.$buttons.indexOf(target as ShapeAnimatedElement);
        if (index !== -1) { // TODO: support for vertical languages?
          const currentWidth = target.style.width;
          target.style.width = '';
          this.#baseWidths[index] = target.getBoundingClientRect().width;
          if (currentWidth) target.style.width = currentWidth;
        }
      });
    });
  }
  override async firstUpdated() {
    await ensureSlottedReady(this, () => this.$buttons, true);
    this.#handleSlotChange();
  }
  override disconnectedCallback() {
    this.#abortController.abort();
    this.#resizeObserver.disconnect();
    super.disconnectedCallback();
  }

  #abortController!: AbortController;
  #activeIndex = -1;
  #resizeObserver!: ResizeObserver;
  #baseWidths: Array<number> = [];

  #handleSlotChange = () => {
    this.#resizeObserver.disconnect();
    this.$buttons.forEach((btn, i) => {
      this.#baseWidths[i] = btn.getBoundingClientRect().width;
      this.#resizeObserver.observe(btn);
    });
  };
  #handlePointerDown = (e: PointerEvent) => {
    if (this === e.target) return;
    this.updateLayout(e.target as HTMLElement);
  };
  #handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    this.updateLayout(e.target as HTMLElement);
  };
  #reset = (e: any) => {
    if (e && e.type === 'keyup' && e.key !== ' ' && e.key !== 'Enter') return;

    if (this.#activeIndex !== -1) {
      this.#activeIndex = -1;
      this.updateLayout();
    }
  };

  /**
   * Passing no element resets all shape changes
   */
  updateLayout(target: HTMLElement | null = null) {
    const pressedIndex = target
      ? this.$buttons.indexOf(target as ShapeAnimatedElement)
      : -1;
    this.#activeIndex = pressedIndex;
    const pressedBaseWidth =
      pressedIndex !== -1 ? this.#baseWidths[pressedIndex] : 0;

    const isPressedAtEdge =
      pressedIndex === 0 || pressedIndex === this.$buttons.length - 1;
    const delta =
      (pressedBaseWidth * (EXPAND_FACTOR - 1)) / (isPressedAtEdge ? 1 : 2);
    const spring = getSpring(this, 'spatial', 'fast');

    this.$buttons.forEach((btn, i) => {
      const currentWidth = btn.getBoundingClientRect().width;
      let targetWidth = this.#baseWidths[i];

      if (pressedIndex !== -1) {
        if (i === pressedIndex) targetWidth = pressedBaseWidth * EXPAND_FACTOR;
        else if (Math.abs(i - pressedIndex) === 1) targetWidth -= delta;
      }

      btn[shapeAnimation]?.cancel();
      const anim = (btn[shapeAnimation] = btn.animate(
        [{ width: `${currentWidth}px` }, { width: `${targetWidth}px` }],
        {
          ...spring,
          fill: 'forwards',
        }
      ));
      anim.finished
        .then(() => {
          if (btn[shapeAnimation] === anim) {
            if (pressedIndex === -1) {
              btn.style.width = '';
              anim.cancel();
            }
            delete btn[shapeAnimation];
          }
        })
        .catch(() => {});
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'md-button-group': M3StandardButtonGroup;
  }
}
