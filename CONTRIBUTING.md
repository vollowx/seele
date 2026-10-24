# Contributing

## Outside the development

- [Committing specification](https://www.conventionalcommits.org/en/v1.0.0/).

~~You should always run `pnpm format:write` before you commit, in order to let
your code follows the styling specification.~~

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

~~Sort CSS properties alphabetically~~, (if you would like to; sometimes it's
more readable to group them by color/layout/etc), CSS variables should be put
before regular CSS properties.

### Problems caused by the order of elements upgrading

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

### Typing Lit query and property decorators

Declare every `@query` field as `T | null`.
`@queryAll` and `@queryAssignedElements` return arrays, so we don't need to set
`!` or `?.` on them.

Especially if the element is always rendered, use `!`; if it is not, for
example, rendered conditionally, use `?`.

```ts
@query('md-ripple') $ripple!: M3Ripple | null;
this.$focusRing!.attach(this);
this.$headline?.animate(...);
```

Also, public mehhods like `show()` and `close()` that involves the former type
of elements should do `await this.updateComplete` first.

`@property` fields are initialized and therefore never `null` unless the
property distinguishes "doesn't exist" and "value is empty", for example the
type of `<a download>` is `string | null`; so always use `!` if you don't want
to set a initial value.
