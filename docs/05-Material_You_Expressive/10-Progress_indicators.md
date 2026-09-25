---
title: Linear, circular progress indicator component - seele/m3
components:
  - m3/progress/circular-progress
  - m3/progress/linear-progress
---

# Progress indicators

- [Material Design](overview)

```typescript
import '@vollowx/seele/m3/progress/circular-progress.js';
import '@vollowx/seele/m3/progress/linear-progress.js';
```

<!-- @uncomment
<div class="demo">
  <md-circular-progress aria-label="Loading pictures" value="25"></md-circular-progress>
  <md-circular-progress aria-label="Loading pictures" style="
    --md-circular-progress-thickness: 6px;
    --md-circular-progress-gap: 8px;
  "></md-circular-progress>
  <md-circular-progress aria-label="Loading pictures" indeterminate></md-circular-progress>
</div>
<div class="demo linear">
  <md-linear-progress aria-label="Loading pictures" value="25"></md-linear-progress>
  <md-linear-progress aria-label="Loading pictures" value="75" style="--md-linear-progress-thickness: 8px"></md-linear-progress>
  <md-linear-progress aria-label="Loading pictures" indeterminate></md-linear-progress>
</div>

<style>
  .demo {
    max-width: 300px;
    display: flex;
    gap: 8px;

    &.linear {
      flex-direction: column;
    }
  }
</style>
-->

```html
<md-circular-progress aria-label="Loading pictures" value="25"></md-circular-progress>
<md-circular-progress aria-label="Loading pictures" style="
  --md-circular-progress-thickness: 6px;
  --md-circular-progress-gap: 8px;
"></md-circular-progress>
<md-circular-progress aria-label="Loading pictures" indeterminate></md-circular-progress>

<md-linear-progress aria-label="Loading pictures" value="25"></md-linear-progress>
<md-linear-progress aria-label="Loading pictures" value="75" style="--md-linear-progress-thickness: 8px"></md-linear-progress>
<md-linear-progress aria-label="Loading pictures" indeterminate></md-linear-progress>
```

## `M3CircularProgress`

- Inherits [`ProgressBar`](../04-Base/10-ProgressBar.md)

## `M3LinearProgress`

- Inherits [`ProgressBar`](../04-Base/10-ProgressBar.md)

[overview]: https://m3.material.io/components/progress-indicators/overview
