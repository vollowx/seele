# `ListBox`

- Inherits [`List`](./10-List.md)
- Mixes [`FormAssociated`](./20-FormAssociated.md)
- Mixes `SelectAPIMixin`

`ListBox` has the `listbox` role and supports keyboard and pointer navigation
and selection. It shares the selection and form API with [`Select`](./10-Select.md).

Form participation, `multiple` and `required`, plus the `selected` of options,
behaves like native `<select>` and `<option>`.

## Events

| name                 | description                                     |
| ---                  | ---                                             |
| `select`             | `detail: { item, index }`                       |
| `input`, `change`    | Fired when user activation changes selection    |
| `item-focus`         | `detail: { item, index }`                       |
| `request-popup-hide` | Fired after single selection or when Escape is pressed |

## Properties

| name           | description                                                                   |
| ---            | ---                                                                           |
| `bare`         | Reflected boolean; an external control owns focus and selection               |
| `multiple`     | Reflected boolean; allow multiple selected options                            |
| `required`     | Reflected boolean; require a selection                                        |
| `value`        | Value of the first selected option; setting it replaces the selection         |
| `$slotItems`   | All elements assigned to the slot, including non-options                     |
| `$allItems`    | All options, including disabled and hidden options                            |
| `$items`       | Array of currently active options (excludes disabled/hidden)                  |
| `$selectedItems` | Array of selected options, including disabled and hidden options            |
| `selectedIndex` | Index in `$allItems` of the first selected option, or `-1`; settable         |
| `currentIndex` | Index in `$items` of the focused item, or `-1`                               |

## Methods

| signature                                     | description                                      |
| ---                                           | ---                                              |
| `focusFirstItem() -> void`                    |                                                  |
| `focusLastItem() -> void`                     |                                                  |
| `focusItem(item: Option) -> void`             |                                                  |
| `selectItem(item: Option \| null) -> void`    | Select an option, or clear selection with `null` |
| `select(value: string) -> void`               | Replace the selection with the matching option   |
| `selectIndex(index: number) -> void`          | Replace the selection with the indexed option    |
| `reset() -> void`                             | Restore the options' default selection           |
| `clearFocus() -> void`                        | Clears the focused item without moving DOM focus |
| `handleKeyDown(event: KeyboardEvent) -> void` | Handles listbox keyboard navigation              |

`selectItem` replaces the selection in single-selection mode and adds an item
in multiple-selection mode. Passing an item outside the listbox throws a
`RangeError`. In `bare` mode, activation fires `select` without changing the
selection; an external control may call `selectItem` itself.
