import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('dev-configurator')
export class DevConfigurator extends LitElement {
  @state() private isRtl = false;
  @state() private isDark = true;

  @state() private tooltipTexts = {
    dir: ['Set direction to right-to-left', 'Set direction to left-to-right'],
    theme: ['Switch to light mode', 'Switch to dark mode'],
  };

  override connectedCallback() {
    super.connectedCallback();
    this._applyDir();
    this._applyTheme();
  }

  private _applyDir() {
    document.documentElement.dir = this.isRtl ? 'rtl' : 'ltr';
  }

  private _applyTheme() {
    document.documentElement.dataset['mdTheme'] = this.isDark
      ? 'dark'
      : 'light';
  }

  private _getTooltipText(type: 'dir' | 'theme', active: boolean): string {
    return this.tooltipTexts[type][active ? 1 : 0];
  }

  private _handleDirToggle(e: CustomEvent) {
    this.isRtl = (e.target as any).checked;
    this._applyDir();
  }

  private _handleThemeToggle(e: CustomEvent) {
    this.isDark = (e.target as any).checked;
    this._applyTheme();
  }

  override render() {
    return html`
      <md-icon-button-toggle
        id="toggle-dir"
        variant="outlined"
        ?checked=${this.isRtl}
        @change=${this._handleDirToggle}
      >
        <svg slot="checked" viewBox="0 0 24 24" width="24" height="24">
          <path
            fill="currentColor"
            d="M10.135 14.5V9.73h-.443q-1.4 0-2.373-.982t-.973-2.382t.973-2.383T9.692 3h6.231v1h-1.884v10.5h-1V4h-1.905v10.5zm0-5.77V4h-.443q-.978 0-1.662.696q-.684.695-.684 1.672q0 .976.684 1.67q.684.693 1.662.693zM16.827 21l-.708-.708l1.966-1.965H4v-1h14.066L16.1 15.361l.727-.726L20 17.808z"
          />
        </svg>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path
            fill="currentColor"
            d="M10.135 14.5V9.73h-.443q-1.4 0-2.373-.982t-.973-2.382t.973-2.383T9.692 3h6.231v1h-1.884v10.5h-1V4h-1.905v10.5zm-4.239 3.827l1.985 1.965l-.708.708L4 17.808l3.173-3.174l.727.728l-1.984 1.965H20v1zm4.239-9.596V4h-.443q-.978 0-1.662.696q-.684.695-.684 1.672q0 .976.684 1.67q.684.693 1.662.693zm0-2.365"
          />
        </svg>
      </md-icon-button-toggle>
      <md-tooltip for="toggle-dir">
        ${this._getTooltipText('dir', this.isRtl)}
      </md-tooltip>

      <md-icon-button-toggle
        id="toggle-theme"
        variant="filled"
        ?checked=${this.isDark}
        @change=${this._handleThemeToggle}
      >
        <svg slot="checked" viewBox="0 0 24 24" width="24" height="24">
          <path
            fill="currentColor"
            d="M12 21q-3.75 0-6.375-2.625T3 12q0-3.75 2.625-6.375T12 3q.35 0 .688.025t.662.075q-1.025.725-1.638 1.888T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q1.3 0 2.513-.613T20.9 10.65q.05.325.075.663T21 12q0 3.75-2.625 6.375T12 21"
          />
        </svg>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path
            fill="currentColor"
            d="M12 17q-2.075 0-3.537-1.463T7 12q0-2.075 1.463-3.537T12 7q2.075 0 3.538 1.463T17 12q0 2.075-1.462 3.538T12 17m-1-12V2h2v3zm0 17v-3h2v3zm10-10h-3v-2h3zm-17 0H2v-2h3zm14.25-6.85l-1.4-1.4l2.125-2.125l1.4 1.4zm-14.1 14.1l-1.4-1.4l2.125-2.125l1.4 1.4zm14.1 0l2.125-2.125l1.4 1.4l-2.125 2.125zM4.275 6.4l2.125-2.125l1.4 1.4L5.675 7.8z"
          />
        </svg>
      </md-icon-button-toggle>
      <md-tooltip for="toggle-theme">
        ${this._getTooltipText('theme', this.isDark)}
      </md-tooltip>
    `;
  }
}
