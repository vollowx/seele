# Standard Extensible Elements

SEELE (**S**tandard **E**xtensible **Ele**ments) is a extensible
[Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
library with a focus on accessibility and keyboard-control.

It also provides styled components in the following design guideline(s):
- [Material You Expressive](https://m3.material.io/)

Documentations and demos are at [seele.projects.v9.nz](https://seele.projects.v9.nz/).

## Installation

SEELE is published on [npm](https://www.npmjs.com/package/@vollowx/seele),
install with your preferred package manager:

```sh
npm install @vollowx/seele

yarn add @vollowx/seele

bun add @vollowx/seele
```

## Quickstart

### Importing

You can import the entire library or import as needed.

```javascript
// Import all components
import '@vollowx/seele';

// Or import specific components (recommended)
// They all follow such path: @/catagory/group/component.js
import '@vollowx/seele/m3/button/common-button.js';
import '@vollowx/seele/m3/checkbox/checkbox.js';
```

### Using

Once imported, the components can be used just like standard HTML elements.

```html
<md-button variant="filled">Filled Button</md-button>
<md-button variant="outlined">Outlined Button</md-button>

<label>
  <md-checkbox checked></md-checkbox>
  Labelled Checkbox
</label>
```

### Theming

SEELE components use CSS variables for styling. To include the systems, add
this to your style files.

```css
@import '@vollowx/seele/m3/systems/base.css';
/* This includes basic system variables like motion system and typography system */
@import '@vollowx/seele/m3/systems/defaults.css';
/* (Optional) This includes basic styling for body, selection and links */

/*
 * Note that there is no default color system since the way you implement theme
 * switching and color changing varies.
 *
 * You can still find some references in dev/shared.css
 */
```

## Browser Support

SEELE relies on modern web standards like `ElementInternals`.
However in 2026 you don't really need to worry about this.

- Chromium-based ones: >= 125.0
- Firefox-based ones: >= 126.0

## Other Information

- [Roadmap](./ROADMAP.md)
- [Contributing](./CONTRIBUTING.md)
- [License (Apache-2.0)](./LICENSE)
