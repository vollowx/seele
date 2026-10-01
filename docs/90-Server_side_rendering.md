---
title: SSR - seele
---

# Rendering seele server-side

Follow the [Lit SSR documentation][lit-ssr] and
[@lit-labs/ssr documentation][lit-labs-ssr].

- Astro: the [official support][astro-lit-integration] for Lit SSR was stopped
  in Astro v5, however you can use [Astro-Lit][astro-lit].
- Eleventy: [eleventy-plugin-lit][eleventy-plugin-lit].

There is also an [example][timor] without using frameworks:

- [Building script](https://github.com/vollowx/timor/blob/main/scripts/build.ts)
- [SSR entry point](https://github.com/vollowx/timor/blob/main/src/ssr-entrypoint.ts)

## How SSR is handled in seele

Here are some experiences in seele in terms of SSR.

### Outputting less useless code on server

Some invisible components are not SSR'd, for example `<md-ripple>` and
`<md-focus-ring>`. The extra cost is that you need to align them with

```css
md-ripple,
md-focus-ring {
  position: absolute;
}
```

in some flexbox containers with gaps (or similar) to prevent layout shift; in
return we save usually dozens of KBs of invisible shadow root templates in the
rendered result. Though the duplicated templates outputted without bypassing
such components will get gzipped eventually, I still consider this worthy.

### In constructor()

Setting event listeners on a component's host should be done in
`constructor()`, guarded with `isServer` from Lit; initial ElementInternals
values should also be set in `constructor()`, but without any condition; like
below:

```ts
class A extends InternalsAttached(LitElement) {
  constructor() {
    super();
    this[internals].role = 'listbox';
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    if (!isServer) {
      this.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.addEventListener('click', this.#handleClick.bind(this));
    }
  }
}
```

[lit-ssr]: https://lit.dev/docs/ssr/overview/
[lit-labs-ssr]: https://github.com/lit/lit/tree/main/packages/labs/ssr#readme
[astro-lit-integration]: https://docs.astro.build/en/guides/integrations-guide/lit/
[astro-lit]: https://github.com/Semantic-Org/Astro-Lit
[eleventy-plugin-lit]: https://github.com/lit/lit/tree/main/packages/labs/eleventy-plugin-lit
[timor]: https://github.com/vollowx/timor
