---
'@arun-dev/ui': minor
---

**Breaking.** Removes the APIs deprecated in 0.2.0, and gives `Button` and `Card` the same
composition surface `Chip` and `Badge` already had.

## Removed

- **`Chip`'s `as` prop.** Use `render` instead — it accepts any element, not just `span`/`button`.

  ```diff
  - <Chip as="button" onClick={…}>Tag</Chip>
  + <Chip render={<button type="button" />} onClick={…}>Tag</Chip>
  ```

  Note `as="button"` supplied `type="button"` implicitly; with `render` it belongs on the element,
  or the button defaults to `type="submit"` and can submit an enclosing form.

- **`Badge`'s `variant` prop and the `difficulty-*` variants**, along with their CSS. They put
  article vocabulary into a brand-agnostic library and required consumers to define six
  `--color-difficulty-*` tokens this package never shipped — a consumer who did not got a badge
  that silently rendered as plain. Use `tone` and map your own vocabulary at the call site.

  ```diff
  - <Badge variant="difficulty-beginner">Beginner</Badge>
  + <Badge tone="success">Beginner</Badge>
  ```

## Added

- **`render`, prop spreading and `ref` on `Button` and `Card`**, matching `Chip` and `Badge`.

  `Card` previously destructured only `{ as, lift, className, children }` and spread nothing, so
  `aria-label` on a `<Card as="nav">` was silently dropped — an accessibility bug, not just a
  missing convenience.

  `Button`'s `ButtonAsLink | ButtonAsButton` union is gone. It could not express a router link, and
  its `never`-typed members forced unsound `as` casts internally. `href` still renders an `<a>`;
  anything else goes through `render`.

  ```tsx
  <Button render={<NextLink href="/docs" />}>Docs</Button>
  <Card render={<article />} lift>…</Card>
  ```

- `Button`, `Card`, `Chip` and `Badge` are now all built on one internal render engine, so prop
  merging, `className` concatenation, handler chaining and ref merging behave identically across
  the set.

## Internal

`Button` and `Card` move to co-located folders, completing the layout `Chip` and `Badge` adopted in
0.2.0. Published subpath exports are unchanged — `@arun-dev/ui/css/btn` and `…/css/card` resolve
exactly as before.

The token contract test's list of consumer-supplied properties is now empty: this package defines
every custom property it reads.
