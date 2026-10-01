---
title: Overview - seele
components:
  - m3/button/common-button
---

# seele

seele (**S**tandard **E**xtensible **Ele**ments) is an extensible
[Web Components][web-comps] library with a focus on accessibility and
keyboard navigation.

<!-- @uncomment
<md-button size="xl" style="width: 100%; margin-block-start: 8px" onclick="navigation.navigate('./m3/playground/')">
  <iconify-icon slot="icon" icon="material-symbols:category-outline"></iconify-icon>
  Playground
</md-button>
<md-button variant="tonal" size="l" style="width: 100%; margin-block-start: 8px" onclick="navigation.navigate('https://vollowx.github.io/timor/')">
  <iconify-icon slot="icon" icon="material-symbols:globe-clock"></iconify-icon>
  Demo app - Timor
</md-button>
<p><i>* As per experience from the Eleventy website, yes, this is probably necessary.</i></p>
<p><i>* And yes, this button requires Firefox 147 and Safari 26.2 to be a working link.</i></p>
-->

To try seele without installing it, you can use [importmap](importmap) like
below.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vollowx/seele/src/m3/styles/base.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vollowx/seele/src/m3/styles/motion-expressive.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vollowx/seele/src/m3/styles/defaults.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vollowx/seele/src/m3/styles/color-default-light.css" media="screen and (prefers-color-scheme: light)" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vollowx/seele/src/m3/styles/color-default-dark.css" media="screen and (prefers-color-scheme: dark)" />

<script type="importmap">
  {
    "imports": {
      "@vollowx/seele/": "https://esm.run/@vollowx/seele/"
    }
  }
</script>
<script type="module">
  import '@vollowx/seele/all.js';
</script>

<md-button>Filled button</md-button>
<md-switch checked aria-label="draggable switch"></md-switch>
<md-loading contained aria-label="loading nothing"></md-loading>
```

## Design systems

seele has component behaviors in `base` and visuals in design systems that
extend it. Most users only need to pick one design system below and import from
it, `base` and `core` are lower-level parts the design systems rely on.

| overview page                                                          | path prefix | origin                                |
| ---------------------------------------------------------------------- | ----------- | ------------------------------------- |
| [Material You Expressive](./05-Material_You_Expressive/00-Overview.md) | `m3`        | Google's [Material Design 3][m3-home] |
| [Windows 98](./06-Windows_98/00-Overview.md)                           | `win98`     | Windows 98 look                       |

Each design system contains not only components, but also assets like styles
and helper utils. See `00-Overview.md` for each design system for its full
component list.

### Foundations

- [`base`](./04-Base/00-Overview.md) implements behavior and accessibility
  without visuals, and design systems extend it. Import from it directly if you
  are writing components in your own design system.
- `core` includes decorators and utilities like focus control. It has no
  components of its own.

## Installation

seele is published on npm at [`@vollowx/seele`](npm-package), so you can install
it with:

```sh
npm i @vollowx/seele
```

To start using seele, you will need a bundler and dev server that can resolve
Node package paths, for example [web-dev-server](web-dev-server) and
[esbuild](esbuild). You can take a look at [seele-example](seele-example), which
contains a minimal setup for using seele (or actually any other Web Components
library).

## Usage

```typescript
// Import all components (not recommended)
import '@vollowx/seele';

// Or import specific components
// They all follow such path: @/catagory/group/component.js

import '@vollowx/seele/m3/button/common-button.js';
import '@vollowx/seele/m3/checkbox/checkbox.js';

import '@vollowx/seele/win98/button/button.js';
```


The `<category>` is one of `core`, `base`, `m3` or `win98` (see
[Design systems](#design-systems) above). The `<component>` does not
necessarily match the name of the component. Such relationship is documented on
the page of each component.

To see all components you can import directly, see [all.ts](all).

## Compatibility

In short, Chromium: >= 135, Firefox: >= 136 and Safari: >= 17.5.

See [Compatibility](./03-Compatibility.md).

## Roadmap

See [Roadmap](./01-Roadmap.md).

## Notes

1. If a component gets some properties or parts by extending or mixing, the
   properties and parts are only shown at the super class or mixins.

This documentation is also available at:

- as a website with demos rendered
  - [tideover.cc/seele/docs/](https://tideover.cc/seele/docs/)
  - [lucaz.srht.site](https://lucaz.srht.site/) (auto-built site, external resources like icons cannot be loaded)
- as Markdown
  - [SourceHut](https://git.sr.ht/~lucaz/seele/tree/main/item/docs/00-Overview.md)
  - [GitHub](https://github.com/vollowx/seele/blob/main/docs/00-Overview.md)

[web-comps]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
[m3-home]: https://m3.material.io/
[npm-package]: https://www.npmjs.com/package/@vollowx/seele
[seele-example]: https://github.com/vollowx/seele-example/
[web-dev-server]: https://modern-web.dev/docs/dev-server/overview/
[esbuild]: https://esbuild.github.io/
[importmap]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap
[all]: https://github.com/vollowx/seele/blob/main/src/all.ts
