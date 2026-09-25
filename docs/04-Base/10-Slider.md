# `Slider`

- Mixes [`InternalsAttached`](./20-InternalsAttached.md)
- Mixes [`FocusDelegated`](./20-FocusDelegated.md)
- Mixes [`FormAssociated`](./20-FormAssociated.md)

## Properties

name                 | description
---                  | ---
`min`                | Number; `0` by default
`max`                | Number; `100` by default
`step`               | Number; `1` by default
`value`              | Number or undefined
`valueStart`         | Number or undefined; start value for range mode; `value-start` as an attribute
`valueEnd`           | Number or undefined; end value for range mode; `value-end` as an attribute
`valueLabel`         | String; label shown above the handle; `value-label` as an attribute
`valueLabelStart`    | String; label for the start handle; `value-label-start` as an attribute
`valueLabelEnd`      | String; label for the end handle; `value-label-end` as an attribute
`ariaLabelStart`     | String; `aria-label-start` as an attribute
`ariaValueTextStart` | String; `aria-valuetext-start` as an attribute
`ariaLabelEnd`       | String; `aria-label-end` as an attribute
`ariaValueTextEnd`   | String; `aria-valuetext-end` as an attribute
`nameStart`          | String; form name for start value; `name-start` as an attribute
`nameEnd`            | String; form name for end value; `name-end` as an attribute
`range`              | Boolean; two-handle range mode
