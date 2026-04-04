# Contributing

## Outside the developments

- [Committing specification](https://www.conventionalcommits.org/en/v1.0.0/).

You should always run `bun prettier:fix` before you commit, in order to let your
code follows the styling specification.

## Element behaviors

- For base elements, see [W3C](https://www.w3.org/WAI/ARIA/apg/example-index/).
- For Material You styled elements, see [Material You](https://m3.material.io/).

## Element styling

### Selectors

Use `[part~="name"]` inside a component, while only end users use
`::part(name)` so that the style overriding works correctly.

### Properties

Sort CSS properties alphabetically, move CSS variables before regular CSS
properties.
