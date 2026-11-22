# `Autocomplete`

- Mixes [`InternalsAttached`](./20-InternalsAttached.md)
- Mixes [`FocusDelegated`](./20-FocusDelegated.md)

When the popup is open, Page Up and Page Down navigate the listbox. Home and
End remain available for editing the input.

## Slots

| name    | description       |
| ---     | ---               |
| `input` | The input element |
|         | Option elements   |

## Properties

| name     | description                                                                |
| ---      | ---                                                                        |
| `open`   |                                                                            |
| `mode`   | String; `none`, `list` or `both`; controls filtering and inline completion |
| `$popup` | The inner popup element                                                    |
| `$listbox` | The inner listbox element                                                |

## Methods

| signature | description |
| --- | --- |
| `renderMenu() -> TemplateResult` | Override to render a popup and listbox inside the component |
