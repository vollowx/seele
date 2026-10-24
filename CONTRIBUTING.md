# Contributing

## Outside the development

- [Committing specification](https://www.conventionalcommits.org/en/v1.0.0/).

You should always run `bun format:write` before you commit, in order to let your
code follows the styling specification.

## Element behaviors

- For base elements, see [W3C](https://www.w3.org/WAI/ARIA/apg/example-index/).
- For Material You styled elements, see [Material You](https://m3.material.io/).

## Writing an element

### Structure

For every component, the class should follow the structure below:

- `@property`s, `@query`s and other element getters, etc
- `styles`
- `render()`
- Any other things

All `@query`s and other element getters should be named like `$something`.

### Functions

For any function that is not supposed to be called outside the component
itself, make it private (i.e. `#handleClick`), if it might be overridden by
a class inheriting it, put an `_` before (i.e. `_handlePointerdown`).
Otherwise, it's fine not to decorate it (i.e. `selectTab`).

### Selectors

Use `[part~="name"]` inside a component, while only end users use
`::part(name)` so that the style overriding works correctly.

### CSS

Sort CSS properties alphabetically, CSS variables should be put before regular
CSS properties.

### Rare cases conventions

`slotchange` will not be triggered on SSR'd elements, call the handler manually
in `firstUpdated` with a `ensureSlottedReady` before it. If you want to access a
custom element in such events that might not be registered yet, use
`ensureReady(thatElement)`, and don't use the other one in this case to avoid
unnecessary calls.

_* Check out `src/core/ensure-ready.ts`._

Transitions on the host like `border-radius` will be shown at first-paint, use
`notransition` attribute to block that and use nested `requestAnimationFrame`
in `connectedCallback` to remove that attribute. Only one `rAF` will not work
since the callback is called before the painting.

### Attributes and properties

When a property contains multiple words, like `keepOpenOnBlur`, use kebab-case
like `keep-open-on-blur` for its attribute binding.

If it is native-like, e.g. `readonly`, `maxlength`, keep it as is as attributes.

For `tabindex` that is supposed to by synchronized to a child element in the
shadow root, use `data-tabindex`, and such case applies to `role` and `aria-*`,
too.
