---
title: Icon button component - seele/m3
components:
  - m3/button/icon-button
  - m3/button/icon-button-toggle
  - m3/button/icon-button-link
---

# Icon button

- [Material Design](overview)

```typescript
import '@vollowx/seele/m3/button/icon-button.js';
import '@vollowx/seele/m3/button/icon-button-toggle.js';
import '@vollowx/seele/m3/button/icon-button-link.js';
```

<!-- @show -->

```html
<md-icon-button>
  <iconify-icon icon="material-symbols:more-vert"></iconify-icon>
</md-icon-button>
<md-icon-button-toggle size="l" variant="filled">
  <iconify-icon icon="material-symbols:settings-outline"></iconify-icon>
  <iconify-icon icon="material-symbols:settings" slot="checked"></iconify-icon>
</md-icon-button-toggle>
<md-icon-button-toggle size="l" variant="filled" checked>
  <iconify-icon icon="material-symbols:settings-outline"></iconify-icon>
  <iconify-icon icon="material-symbols:settings" slot="checked"></iconify-icon>
</md-icon-button-toggle>
<md-icon-button width="wide" size="m" variant="tonal">
  <iconify-icon icon="material-symbols:download"></iconify-icon>
</md-icon-button>
<md-icon-button width="narrow" size="m" variant="outlined">
  <iconify-icon icon="material-symbols:delete-outline"></iconify-icon>
</md-icon-button>

<md-icon-button-link
  href="https://github.com/vollowx/seele"
  target="_blank"
  variant="outlined"
>
  <iconify-icon
    icon="material-symbols:code"
    aria-label="vollowx/seele on GitHub"
  ></iconify-icon>
</md-icon-button-link>
```

## Link

See [Native or JavaScript link](./10-Button.md#native-or-javascript-link).

## `M3IconButton`, `M3IconButtonToggle` and `M3IconButtonLink`

- `M3IconButton` inherits [`Button`](../04-Base/10-Button.md)
- `M3IconButtonToggle` inherits `M3IconButton`
- `M3IconButtonToggle` mixes [`ButtonToggleMixin`](../04-Base/20-ButtonToggleMixin.md)
- `M3IconButtonLink` inherits [`Anchor`](../04-Base/10-Anchor.md)

### Slots

| name      | description                                                |
| ---       | ---                                                        |
|           | The icon or unchecked icon (only for `M3IconButtonToggle`) |
| `checked` | The checked icon (only for `M3IconButtonToggle`)           |

### CSS Parts

name        | description
---         | ---
`icon`      | All icons
`checked`   | (only for `M3IconButtonToggle`)
`unchecked` | (only for `M3IconButtonToggle`)
`anchor`    | The `<a>` element (only for `M3IconButtonLink`) |

### Properties

| name      | description                                                                  |
| ---       | ---                                                                          |
| `color`   | Reflected string; `primary`, `secondary` or `tertiary`; `primary` by default |
| `size`    | Reflected string; `xs`, `s`, `m`, `l` or `xl`; `s` by default                |
| `width`   | Reflected string; `narrow`, `standard` or `wide`; `standard` by default      |
| `variant` | Reflected string; `filled`, `tonal`, `outlined` or `text`; `text` by default |

[overview]: https://m3.material.io/components/icon-buttons/overview
