---
title: SSR - seele
---

# Rendering seele server-side

Here are basically some experiences in terms of Lit SSR. You should check the
[Lit SSR documentation](lit-ssr) first, and then
[@lit-labs/ssr documentation](lit-labs-ssr).

- Astro: the [official support](astro-lit-integration) for Lit SSR was stopped
  in Astro v5, however you can use [Astro-Lit](astro-lit).
- Eleventy: usually [eleventy-plugin-lit](eleventy-plugin-lit) is used.

There is also an [example](timor) without using frameworks:

- [Building script](https://github.com/vollowx/timor/blob/main/scripts/build.ts)
- [SSR entry point](https://github.com/vollowx/timor/blob/main/src/ssr-entrypoint.ts)

## How SSR is handled in seele

Some invisible components are not SSR'd, for example `<md-ripple>` and
`<md-focus-ring>`, and the extra cost is to align them with

```css
md-ripple,
md-focus-ring {
  position: absolute;
}
```

in some flexbox containers with gaps; in return we save usually dozens of KBs
of invisible shadow root templates in the rendered result.

[lit-ssr]: https://lit.dev/docs/ssr/overview/
[lit-labs-ssr]: https://github.com/lit/lit/tree/main/packages/labs/ssr#readme
[astro-lit-integration]: https://docs.astro.build/en/guides/integrations-guide/lit/
[astro-lit]: https://github.com/Semantic-Org/Astro-Lit
[eleventy-plugin-lit]: https://github.com/lit/lit/tree/main/packages/labs/eleventy-plugin-lit
[timor]: https://github.com/vollowx/timor
