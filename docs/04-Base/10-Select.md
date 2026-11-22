# `Select`

- Mixes [`InternalsAttached`](./20-InternalsAttached.md)
- Mixes [`FocusDelegated`](./20-FocusDelegated.md)
- Mixes [`FormAssociated`](./20-FormAssociated.md)
- Mixes `SelectAPIMixin`

Select shares the selection, navigation, and form API of
[`ListBox`](./10-ListBox.md); its additional API controls the popup and field.

Form participation, `multiple` and `required`, plus the `selected` of options,
behaves the same as native `<select>` and `<option>`.

## CSS Parts

| name      | description               |
| ---       | ---                       |
| `field`   | The field trigger element |
| `popup`   | The dropdown              |
| `listbox` | The listbox inside        |
| `value`   | The displayed value text  |

## Events

| name     | description |
| ---      | ---         |
| `change` |             |
| `input`  |             |

## Properties

| name              | description                                                                       |
| ---               | ---                                                                               |
| `required`        | Reflected boolean                                                                 |
| `multiple`        | Reflected boolean; allow multiple selected options                                |
| `bare`            | Reflected boolean; an external control owns focus and selection                   |
| `error`           |                                                                                   |
| `open`            |                                                                                   |
| `displayText`     | String; text shown in the field before options load (SSR); `display-text` as attr |
| `value`           | String; getting/setting also selects the matching option                          |
| `selectedIndex`   | Index in `$allItems` of the selected option; `-1` if none; `selected-index` as attr |
| `$field`          |                                                                                   |
| `$popup`          |                                                                                   |
| `$listbox`        | The listbox element                                                               |
| `$slotItems`      | All elements assigned to the listbox slot, including non-options                  |
| `$allItems`       | All options, including disabled and hidden options                                |
| `$selectedItems`  | Array of currently selected options                                               |
| `$items`          | Navigable options, excluding disabled and hidden options                          |
| `currentIndex`    | Index of the focused item in `$items`, or `-1`                                    |

## Methods

| signature                            | description                                 |
| ---                                  | ---                                         |
| `select(value: string) -> void`      | Selects the option matching the given value |
| `selectIndex(index: number) -> void` | Selects the option at the given index       |
| `reset() -> void`                    | Restore the options' default selection      |
| `selectItem(item: Option \| null) -> void` | Select an item or clear selection     |
| `toggle() -> void`                   | Toggle the dropdown open/closed             |
