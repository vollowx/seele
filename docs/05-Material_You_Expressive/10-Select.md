---
title: Select component - seele/m3
components:
  - m3/select/option
  - m3/select/filled-select
  - m3/select/outlined-select
---

# Select

- [Material Design](overview)

```typescript
import '@vollowx/seele/m3/select/filled-select.js';
import '@vollowx/seele/m3/select/outlined-select.js';
```

<!-- @show -->

```html
<md-filled-select name="fruit" label="Fruit">
  <md-option value="apple">Apple</md-option>
  <md-option value="apricot">Apricot</md-option>
  <md-option value="banana">Banana</md-option>
  <md-option value="cherry">Cherry</md-option>
  <md-option value="grape">Grape</md-option>
  <md-option value="lemon">Lemon</md-option>
  <md-option value="mango">Mango</md-option>
  <md-option value="orange">Orange</md-option>
  <md-option value="strawberry">Strawberry</md-option>
  <md-option value="watermelon">Watermelon</md-option>
</md-filled-select>
```

Add `multiple` to allow multiple selections. The popup stays open while
options are toggled, and selected labels are shown separated by commas.

## `M3FilledSelect` and `M3OutlinedSelect`

- Inherits [`Select`](../04-Base/10-Select.md) (via `M3Select`)

### Properties

| name             | description                                         |
| ---              | ---                                                 |
| `label`          |                                                     |
| `supportingText` | Reflected string; `supporting-text` as an attribute |

## `M3Option`

- Inherits [`Option`](../04-Base/10-Option.md)

[overview]: https://m3.material.io/components/selects/overview
