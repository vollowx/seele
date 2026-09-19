---
title: Menu component - seele/m3
components:
  - m3/menu/composed-menu
  - m3/menu/menu-item
---

# Menu

- [Material Design](overview)

```typescript
import '@vollowx/seele/m3/menu/composed-menu.js';
import '@vollowx/seele/m3/menu/menu-item.js';
```

<!-- @show -->

```html
<md-button id="someButton">File</md-button>
<md-composed-menu for="someButton" vibrant>
  <md-menu-item>New Text File</md-menu-item>
  <md-menu-item>
    New File...
    <span slot="supporting-text">Not so supporting texts</span>
  </md-menu-item>
  <md-menu-item>
    <span slot="overline">Over it</span>
    New Window
    <iconify-icon slot="end" icon="material-symbols:window"></iconify-icon>
  </md-menu-item>
  <md-divider inset></md-divider>
  <md-menu-item>Open File...</md-menu-item>
  <md-menu-item>Open Folder...</md-menu-item>
  <md-divider inset></md-divider>
  <md-menu-item selected>Save</md-menu-item>
  <md-menu-item>Save As...</md-menu-item>
</md-composed-menu>
```

You can have more precise control on the menu element by not using
`md-composed-menu`, like this:

```html
<md-button
  id="anotherButton"
  aria-haspopup="menu"
  aria-controls="anotherMenu"
>
  Settings
</md-button>
<md-popup for="anotherButton" role="application" vibrant>
  <md-menu id="anotherMenu" aria-label="Labeled menu" style="width: 200px">
    <md-menu-item>Alphabet</md-menu-item>
    <md-menu-item>Apple</md-menu-item>
    <md-menu-item>Blueprint</md-menu-item>
    <md-menu-item>Crust</md-menu-item>
    <md-menu-item>Introduction</md-menu-item>
    <md-menu-item>Json</md-menu-item>
    <md-menu-item>Klint</md-menu-item>
    <md-menu-item>Linter</md-menu-item>
    <md-menu-item>Market</md-menu-item>
    <md-menu-item>Manifest</md-menu-item>
    <md-menu-item>Zed</md-menu-item>
  </md-menu>
</md-popup>
```

## `M3ComposedMenu`

- Inherits [`ComposedMenu`](../04-Base/10-ComposedMenu.md)

A popup that wraps an `M3Menu` inside a [`Popup`](../04-Base/10-Popup.md). Use
this for standalone menus anchored to a button or other control.

### Properties

| name      | description       |
| ---       | ---               |
| `vibrant` | Reflected boolean |
| `$menu`   |                   |

## `M3Menu`

A bare menu without popup or positioning. Used inside `M3ComposedMenu` and
`M3Select`.

- Inherits [`Menu`](../04-Base/10-Menu.md)

## `M3MenuItem`

- Inherits [`M3ListItem`](./10-List.md#m3listitem)

[overview]: https://m3.material.io/components/menus/overview
