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
`align`          | Reflected string; floating-ui placement; `top` by default
`offset`         | Reflected number; pixel distance from anchor; `4` by default
`forceInvisible` | Reflected boolean; force the tooltip to stay hidden
`$slot`          | The default slot element

[lit-ele]: https://lit.dev/docs/api/LitElement/
