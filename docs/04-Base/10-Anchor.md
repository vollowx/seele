# `Anchor`

- Mixes [`FocusDelegated`](./20-FocusDelegated.md)
- Mixes [`InternalsAttached`](./20-InternalsAttached.md)

## Properties

| name             | description                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `download`       | String or `null`; `null` by default; `''` means the filename is suggested by the browser |
| `href`           | String; `''` by default                                                                  |
| `hreflang`       | String; `''` by default                                                                  |
| `ping`           | `Array<string>` of the space-separated URLs to ping; `[]` by default                     |
| `referrerpolicy` | String; `''` by default                                                                  |
| `rel`            | String; `''` by default                                                                  |
| `target`         | String; `''` by default                                                                  |
| `$anchor`        | The inner `<a>` element                                                                  |

## Methods

| signature                | description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| `click()`                | Clicks the inner `<a>` element                                         |
| `_renderAnchor(content)` | Wraps `content` in an `<a>` element with the anchor properties applied |
