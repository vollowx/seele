# `ComposedMenu`

- Inherits [`Popup`](./10-Popup.md)

A popup that wraps a [`Menu`](./10-Menu.md). Use this for standalone menus
anchored to a button or other control.

The host element has `role` set to `application` for better keyboard navigation
when using a screen reader, and `aria-roledescription` set to `Menu` so that
the reader reads "... menu" instead of "... application". You should set
`aria-roledescription` manually according to the language of your webpage.

## Slots

| name | description    |
| ---  | ---            |
|      | The menu items |

## CSS Parts

| name   | description                         |
| ---    | ---                                 |
| `menu` | The internal [`Menu`](./10-Menu.md) |

## Properties

| name    | description                         |
| ---     | ---                                 |
| `$menu` | The internal [`Menu`](./10-Menu.md) |

Inherits all [`Popup`](./10-Popup.md) properties.
