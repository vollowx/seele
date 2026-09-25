---
title: Slider component - seele/m3
components:
  - m3/slider/slider
---

# Slider

- [Material Design](overview)

```typescript
import '@vollowx/seele/m3/slider/slider.js';
```

<!-- @show -->

```html
<md-slider data-aria-label="Brightness" labeled size="l" value="75"></md-slider>
<md-slider
  range
  ticks
  step="10"
  value-start="20" value-end="80"
  aria-label-start="Minimum price"
  aria-label-end="Maximum price"></md-slider>
```

## `M3Slider`

- Inherits [`Slider`](../04-Base/10-Slider.md)

### Properties

|  name  | description                                                    |
| ---    | ---                                                            |
| `size` | Reflected string; `xs`, `s`, `m`, `l` or `xl`; `xs` by default |

[overview]: https://m3.material.io/components/sliders/overview
