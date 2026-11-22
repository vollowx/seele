# `Menu`

- Mixes [`InternalsAttached`](./20-InternalsAttached.md)

Mouse hover on a menu item that has a submenu opens the submenu after 400ms.
Moving to a sibling closes the previous submenu after the same delay; entering
that submenu first cancels the close. A mouse press opens the submenu
immediately.

The delay is kept the same as it is in Windows win32 programs.

## CSS Parts

| name    | description        |
| ---     | ---                |
| `items` | The slot container |

## Events

| name                 | description                                                                                          |
| ---                  | ---                                                                                                  |
| `action`             | `detail: { item, index }`                                                                            |
| `item-focus`         | `detail: { item, index }`                                                                            |
| `request-popup-hide` | Fired after an action when `keepOpenAction` is `false`; the parent `Popup` listens for this to close |

## Properties

| name             | description                                                                             |
| ---              | ---                                                                                     |
| `keepOpenAction` | Boolean; keep the menu from requesting popup hide on action; `keep-open-action` as attr |
| `bare`           | Reflected boolean; disables default menu focus management and keyboard navigation       |
| `$items`         | Array of currently active `MenuItem`s                                                   |
| `currentIndex`   | Number; index of the focused item; `-1` if none                                         |

## Methods

| signature                                     | description                                                          |
| ---                                           | ---                                                                  |
| `focusFirstItem() -> void`                    |                                                                      |
| `focusLastItem() -> void`                     |                                                                      |
| `focusItem(item: MenuItem) -> void`           |                                                                      |
| `handleKeyDown(event: KeyboardEvent) -> void` | Process keyboard navigation; meant to be called by parent components |
