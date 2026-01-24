import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('sd-toolbar')
export class SdToolbar extends LitElement {
  static override styles = css`
    :host {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
    }
    md-icon {
      display: inline-block;
      font-family: 'Material Symbols Rounded';
      font-style: normal;
      font-weight: normal;
      letter-spacing: normal;
      line-height: 1;
      text-transform: none;
      white-space: nowrap;
      word-wrap: normal;
    }
  `;

  @property({ type: String }) githubUrl = 'https://github.com/vollowx/seele';
  @property({ type: Boolean }) rtl = false;

  @state() private themeMode: 'light' | 'dark' | 'auto' = 'auto';
  @state() private tooltipTexts = {
    rtl: ['Set direction to right-to-left', 'Set direction to left-to-right'],
  };

  private _prefersDarkQuery?: MediaQueryList;

  override connectedCallback() {
    super.connectedCallback();
    this._initializeDir();
    this._loadThemePreference();
    this._setupThemeListener();
    this._applyTheme();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._prefersDarkQuery) {
      this._prefersDarkQuery.removeEventListener(
        'change',
        this._handleSystemThemeChange
      );
    }
  }

  private _initializeDir() {
    document.documentElement.dir = this.rtl ? 'rtl' : 'ltr';
  }

  private _loadThemePreference() {
    const stored = localStorage.getItem('sw-theme-preference');
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      this.themeMode = stored;
    }
  }

  private _saveThemePreference() {
    localStorage.setItem('sw-theme-preference', this.themeMode);
  }

  private _setupThemeListener() {
    this._prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._prefersDarkQuery.addEventListener(
      'change',
      this._handleSystemThemeChange
    );
  }

  private _handleSystemThemeChange = () => {
    if (this.themeMode === 'auto') {
      this._applyTheme();
    }
  };

  private _applyTheme() {
    if (this.themeMode === 'auto') {
      const prefersDark =
        this._prefersDarkQuery?.matches ??
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset['mdTheme'] = prefersDark
        ? 'dark'
        : 'light';
    } else {
      document.documentElement.dataset['mdTheme'] = this.themeMode;
    }
  }

  private _getTooltipText(type: 'rtl', checked: boolean): string {
    return this.tooltipTexts[type][checked ? 1 : 0];
  }

  private _toggleThemeMenu() {
    const menu = this.shadowRoot?.querySelector('#theme-menu') as any;
    if (menu) {
      menu.open = !menu.open;
    }
  }

  private _handleThemeSelect(e: CustomEvent) {
    const selectedItem = e.detail.item as HTMLElement;
    const themeValue = selectedItem.dataset.theme as 'light' | 'dark' | 'auto';
    if (themeValue) {
      this.themeMode = themeValue;
      this._applyTheme();
      this._saveThemePreference();
    }
  }

  private _handleDir(e: CustomEvent) {
    this.rtl = e.detail;
    document.documentElement.dir = this.rtl ? 'rtl' : 'ltr';
  }

  private _handleScrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private _handleGithubClick() {
    window.open(this.githubUrl, '_blank');
  }

  override render() {
    return html`
      <md-menu
        id="theme-menu"
        for="action-toggle-theme"
        align="top-end"
        alignStrategy="fixed"
        @select=${this._handleThemeSelect}
      >
        <md-menu-item
          data-theme="light"
          ?selected=${this.themeMode === 'light'}
        >
          Light
        </md-menu-item>
        <md-menu-item data-theme="dark" ?selected=${this.themeMode === 'dark'}>
          Dark
        </md-menu-item>
        <md-menu-item data-theme="auto" ?selected=${this.themeMode === 'auto'}>
          Device Default
        </md-menu-item>
      </md-menu>

      <md-toolbar type="floating" color="vibrant">
        <md-icon-button
          id="action-open-repo"
          aria-label="GitHub repository"
          @click=${this._handleGithubClick}
        >
          <md-icon>code_blocks</md-icon>
        </md-icon-button>
        <md-tooltip for="action-open-repo">View source code</md-tooltip>

        <md-icon-button-toggle
          id="action-toggle-direction"
          variant="tonal"
          ?checked=${this.rtl}
          @change=${this._handleDir}
        >
          <md-icon aria-label="Set direction to RTL">
            format_textdirection_r_to_l
          </md-icon>
          <md-icon slot="checked" aria-label="Set direction to LTR">
            format_textdirection_l_to_r
          </md-icon>
        </md-icon-button-toggle>
        <md-tooltip for="action-toggle-direction">
          ${this._getTooltipText('rtl', this.rtl)}
        </md-tooltip>

        <md-icon-button
          id="action-toggle-theme"
          @click=${this._toggleThemeMenu}
        >
          <md-icon aria-label="Change theme">palette</md-icon>
        </md-icon-button>
        <md-tooltip for="action-toggle-theme"> Change theme </md-tooltip>

        <md-fab
          slot="fab"
          color="tertiary"
          id="scroll-to-top"
          @click=${this._handleScrollToTop}
        >
          <md-icon>arrow_upward</md-icon>
        </md-fab>
        <md-tooltip for="scroll-to-top">Scroll to top</md-tooltip>
      </md-toolbar>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sd-toolbar': SdToolbar;
  }
}
