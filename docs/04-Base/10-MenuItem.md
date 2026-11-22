# `MenuItem`

- Mixes [`InternalsAttached`](./20-InternalsAttached.md)

`MenuItem` has the role `menuitem` and accepts a nested `MenuList` in its
`submenu` slot.

## Properties

| name          | description                           |
| ---           | ---                                   |
| `displayText` | Read-only string; trimmed `innerText` |
| `$submenu`    | Nested `MenuList`, or `null`          |
| `hasSubmenu`  | Whether a nested `MenuList` exists    |
| `submenuOpen` | Whether the submenu is open           |

## Methods

| signature                           | description                                           |
| ---                                 | ---                                                   |
| `openSubmenu(focus = true) -> void` | Opens the submenu, optionally focusing its first item |
