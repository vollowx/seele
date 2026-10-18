---
title: Button component - seele/m3
components:
  - m3/button/common-button
  - m3/button/common-button-toggle
  - m3/button/common-button-link
---

# Button

- [Material Design](overview)
- [WAI-ARIA](wai-aria)

```typescript
import '@vollowx/seele/m3/button/common-button.js';
import '@vollowx/seele/m3/button/common-button-toggle.js';
import '@vollowx/seele/m3/button/common-button-link.js';
```

<!-- @show -->

```html
<md-button trailing-icon size="xs" variant="tonal">
  <iconify-icon icon="material-symbols:more-vert" slot="icon"></iconify-icon>
  Extra small
</md-button>

<md-button-toggle size="m" variant="filled">
  <span>Unselected</span>
  <span slot="checked">Selected</span>
</md-button-toggle>
<md-button-toggle size="m" variant="filled" checked>
  <span>Unselected</span>
  <span slot="checked">Selected</span>
</md-button-toggle>

<br /><br />
<md-button size="m" variant="outlined">Round</md-button>
<md-button square size="m" variant="outlined">Square</md-button>

<br /><br />
<md-button-link href="https://m3.material.io/" target="_blank">
  <iconify-icon icon="material-symbols:open-in-new" slot="icon"></iconify-icon>
  Material Design
</md-button-link>
```

## Native or JavaScript link

It's of your own choice whether to use md-button-link for a native anchor
element or to just bind methods in JS to the click event of a regular md-button.
The former can benefit from the additional features provided by the browser,
like copying link from the context menu, and can be used without JS enabled
when SSR'd; the latter is smaller in size.

```html
<md-button-link href="https://m3.material.io/">
  <md-icon slot="icon">open-in-new</md-icon>
  Material Design
</md-button-link>

<!-- window.location -->
<md-button onclick="location = 'https://m3.material.io/'">
  <md-icon slot="icon">open-in-new</md-icon>
  Material Design
</md-button>

<!-- Navigation API, requires Firefox 147 or higher -->
<md-button onclick="navigation.navigate('https://m3.material.io/')">
  <md-icon slot="icon">open-in-new</md-icon>
  Material Design
</md-button>
```

## `M3Button`, `M3ButtonToggle` and `M3ButtonLink`

- `M3Button` inherits [`Button`](../04-Base/10-Button.md)
- `M3ButtonToggle` inherits `M3Button`
- `M3ButtonToggle` mixes [`ButtonToggleMixin`](../04-Base/20-ButtonToggleMixin.md)
- `M3ButtonLink` inherits [`Anchor`](../04-Base/10-Anchor.md)

### Slots

| name           | description                                              |
| ---            | ---                                                      |
|                | The label or unchecked label (only for `M3ButtonToggle`) |
| `checked`      | The checked label (only for `M3ButtonToggle`)            |
| `icon`         | The icon or unchecked icon (only for `M3ButtonToggle`)   |
| `icon-checked` | The checked icon (only for `M3ButtonToggle`)             |

### CSS Parts

name        | description
---         | ---
`label`     | All labels
`icon`      | All icons
`checked`   | (only for `M3ButtonToggle`)
`unchecked` | (only for `M3ButtonToggle`)
`anchor`    | The `<a>` element (only for `M3ButtonLink`)

### Properties

| name           | description                                                                                |
| ---            | ---                                                                                        |
| `color`        | Reflected string; `primary`, `secondary` or `tertiary`; `primary` by default               |
| `square`       | Reflected boolean; `false` by default                                                      |
| `size`         | Reflected string; `xs`, `s`, `m`, `l` or `xl`; `s` by default                              |
| `trailingIcon` | Reflected boolean; `false` by default; `trailing-icon` as an attribute                     |
| `variant`      | Reflected string; `filled`, `tonal`, `elevated`, `outlined` or `text`; `filled` by default |

[overview]: https://m3.material.io/components/buttons/overview
[wai-aria]: https://www.w3.org/WAI/ARIA/apg/patterns/button/
