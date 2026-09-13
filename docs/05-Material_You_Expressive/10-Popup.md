---
title: Popup component - seele/m3
components:
  - m3/button/common-button
  - m3/popup/popup
---

# Popup

```typescript
import '@vollowx/seele/m3/popup/popup.js';
```

<!-- @show -->

```html
<md-button id="trigger">Trigger</md-button>
<md-popup for="trigger">
  <md-button>There can be button</md-button>
  <p>Or some texts.</p>
</md-popup>
```

## `M3Popup`

- Inherits [`Popup`](../04-Base/10-Popup.md)

### Properties

| name      | description                                                |
| ---       | ---                                                        |
| `quick`   | Reflected boolean; disables showing and hiding transitions |
| `vibrant` | Reflected boolean                                          |
