# `Tooltip`

- Inherits [`LitElement`](lit-ele)
- Mixes [`InternalsAttached`](../04-Base/20-InternalsAttached.md)
- Mixes [`Attachable`](../04-Base/20-Attachable.md)

## Slots

| name | description      |
| ---  | ---              |
|      | The tooltip text |

## Properties

name             | description
---              | ---
`align`          | String; floating-ui placement; `top` by default
`offset`         | Number; pixel distance from anchor; `4` by default
`windowPadding`  | Number; minimum distance from viewport edge; `8` by default; `window-padding` as attr
`forceInvisible` | Reflected boolean; force the tooltip to stay hidden

[lit-ele]: https://lit.dev/docs/api/LitElement/
