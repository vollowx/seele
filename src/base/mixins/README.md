# Base mixins

Due to the time span of mixins being created was too long, some are adjective-
like named, e.g. `FormAssociated`, `InternalsAttached`, and later I found that
doing so is not appropriate for more complex intentions, for example a mixin
that adds APIs for select element, or a mixin that makes a button toggleable.

Considering that it's also not particularly convenient to rename all the old
mixins at once, hence mixins are divided into two groups:

Core mixins:
- `Attachable`
- `Disableable`
- `FocusDelegated`
- `FormAssociated`
- `InternalsAttached`

they keep their adjective-like names, and names for their type declarations are
like `AaaaBbbbInterface` when the mixin is `AaaaBbbb`.

Other mixins:
- `ButtonToggleMixin`
- `SelectAPIMixin`
- ...

their names end with `Mixin`, and names for their type declarations are like
`AaaaBbbbInterfacee` when the mixin is `AaaaBbbbMixin`.