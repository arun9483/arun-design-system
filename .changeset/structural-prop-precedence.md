---
'@arun-dev/headless': major
'@arun-dev/ui': patch
---

**`useRender` now takes the component's props and the consumer's as separate arguments.**

```diff
  useRender({
    render,
    defaultTagName: 'section',
-   props: [{ className, children }, rest],
+   props: { className, children },
+   consumerProps: rest,
  });
```

Precedence — state attributes, then the component's props, then yours, then the `render` element's
— was previously a convention: `props` was an array and each component author had to arrange it
correctly. Nothing caught an inversion, and inverting it would have silently broken
`preventComponentHandler()` for that component while every test still passed. `useRender` now
merges the tiers itself, so there is no arrangement left to get wrong.

Also in this release:

- `Switch.Root` accepts `nativeButton`, matching `Button`. Its dev warning about a `render` that
  is a component rather than an element previously named a fix that did not exist on it.
- The handler-chaining closure in `mergeProps` is extracted as a named `chainHandlers` function.
  No behaviour change; it was hard to read inline, and the nesting it builds is worth a docstring.
