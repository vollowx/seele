import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';

import { FocusDelegated } from './mixins/focus-delegated.js';
import { InternalsAttached } from './mixins/internals-attached.js';
import { hiddenStyles } from './hidden-styles.css.js';

const Base = FocusDelegated(InternalsAttached(LitElement));

export class Anchor extends Base {
  @property() href = '';
  @property() target = '';
  @property() rel = '';
  /**
   * `null` when the attribute is absent, `''` when the attribute is present
   * but empty, in which case the browser suggests a filename, just like a
   * native `<a>`.
   */
  @property() download: string | null = null;
  @property() hreflang = '';
  @property() referrerpolicy = '';
  @property({
    converter: {
      fromAttribute: (value: string | null) =>
        value?.split(/\s+/).filter(Boolean) ?? [],
      toAttribute: (value: Array<string>) => value.join(' '),
    },
  })
  ping: Array<string> = [];
  @query('a') $anchor!: HTMLAnchorElement | null;

  static override styles = [hiddenStyles];
  _renderAnchor(content: unknown) {
    return html`
      <a
        part="anchor"
        href=${this.href || nothing}
        target=${this.target || nothing}
        rel=${this.rel || nothing}
        download=${this.download ?? nothing}
        hreflang=${this.hreflang || nothing}
        referrerpolicy=${this.referrerpolicy || nothing}
        ping=${this.ping.join(' ') || nothing}
      >
        ${content}
      </a>
    `;
  }

  override click() {
    this.$anchor!.click();
  }
}
