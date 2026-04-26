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

SEELE components use CSS variables for styling.

Currently, Material Design 3 token variables are not yet included in the source
code.

To style the components correctly, you need to define the necessary CSS
variables in your project. You can find reference implementations in
[vollowx/seele-docs](https://github.com/vollowx/seele-docs/) or the `dev` folder
of this repository.

## Browser Support

SEELE relies on modern web standards like `ElementInternals`.
However in 2026 you don't really need to worry about this.

- Chromium-based ones: >= 125.0
- Firefox-based ones: >= 126.0

## Other Information

- [Roadmap](./ROADMAP.md)
- [Contributing](./CONTRIBUTING.md)
- [License (Apache-2.0)](./LICENSE)
