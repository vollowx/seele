# `List`

- Mixes [`InternalsAttached`](./20-InternalsAttached.md)

## CSS Parts

| name    | description        |
| ---     | ---                |
| `items` | The slot container |

## Events

| name         | description               |
| ---          | ---                       |
| `select`     | `detail: { item, index }` |
| `item-focus` | `detail: { item, index }` |

## Properties

| name             | description                                                                              |
| ---              | ---                                                                                      |
| `noFocusControl` | Boolean; skip `ariaActiveDescendantElement` tracking; `no-focus-control` as an attribute |
| `$items`         | Array of currently active `ListItem`s (excludes disabled/hidden)                         |
| `currentIndex`   | Number; index of the focused item; `-1` if none                                          |

## Methods

| signature                           | description |
| ---                                 | ---         |
| `focusFirstItem() -> void`          |             |
| `focusLastItem() -> void`           |             |
| `focusItem(item: ListItem) -> void` |             |
| `clearFocus() -> void`              | Clears the focused item without moving DOM focus |
