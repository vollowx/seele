---
title: Compatibility - seele
---

# Compatibility

seele relies on the following modern web standards:

| feature                                                | baseline | Chromium | Firefox | Safari |
| ---                                                    | :---:    | :---:    | :---:   | :---:  |
| [`ElementInternals`][element-internals]                | 2023     | -        | -       | -      |
| [`:dir()`][:dir]                                       | 2023     | 120      | -       | -      |
| [Constructable Stylesheets][constructable-stylesheets] | 2024     | -        | 126     | -      |
| [`:state()`][:state]                                   | 2024     | 125      | 126     | -      |
| [`@starting-style`][starting-style]                    | 2024     | -        | -       | 17.5   |
| [`aria*Element`][aria-active] and similar              | 2025     | 135      | 136     | 16.4   |
| [Popover API][popover-api]                             | 2025     | -        | -       | 17     |
| [`CSSNumericValue`][css-numeric-value]                 | not yet  | -        | Nightly | -      |

_* `CSSNumericValue` is worked around currently so it does not raise the minimum
version of Firefox_

All of the above result in the following minimum requirements:

- Chromium: >= 135
- Firefox: >= 136
- Safari: >= 17.5

It is 2026 now, so you don't really need to worry about this. However, in the
future, the following web features might be used and require higher browser
versions:

| feature                  | benefits                             | baseline | Chromium | Firefox | Safari  |
| ---                      | ---                                  | :---:    | :---:    | :---:   | :---:   |
| [`anchor()`][anchor]     | remove the dependency `floating-dom` | 2026     | -        | 147     | 26      |
| [`alpha()`][alpha]       | replace `oklch()`                    | 2026     | 151      | 155     | 27      |
| [focusgroup][focusgroup] | replace roving focus code            | not yet  | 150      | not yet | not yet |

_* omitting a specific browser version means using that standard does not raise
the minimum required version of seele_

[element-internals]: https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
[:dir]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:dir
[constructable-stylesheets]: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/CSSStyleSheet
[:state]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:state
[aria-active]: https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/ariaActiveDescendantElement
[css-numeric-value]: https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue
[popover-api]: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
[starting-style]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style
[anchor]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/anchor
[alpha]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/alpha
[focusgroup]: https://open-ui.org/components/focusgroup-v2.explainer/
