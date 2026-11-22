# `ListBox`

- Inherits [`List`](./10-List.md)

`ListBox` has the `listbox` role and supports keyboard and pointer navigation
and selection.

## Events

| name                 | description                                     |
| ---                  | ---                                             |
| `select`             | `detail: { item, index }`                       |
| `item-focus`         | `detail: { item, index }`                       |
| `request-popup-hide` | Fired after selection or when Escape is pressed |

## Properties

| name           | description                                                                   |
| ---            | ---                                                                           |
| `bare`         | Reflected boolean; an external control owns focus and `aria-activedescendant` |
| `multiple`     | Reflected boolean; allow multiple selected options                            |
| `$items`       | Array of currently active options (excludes disabled/hidden)                  |
| `currentIndex` | Number; index of the focused item; `-1` if none                               |

## Methods

| signature                                     | description                                      |
| ---                                           | ---                                              |
| `focusFirstItem() -> void`                    |                                                  |
| `focusLastItem() -> void`                     |                                                  |
| `focusItem(item: ListItem) -> void`           |                                                  |
| `clearFocus() -> void`                        | Clears the focused item without moving DOM focus |
| `handleKeyDown(event: KeyboardEvent) -> void` | Handles listbox keyboard navigation              |
