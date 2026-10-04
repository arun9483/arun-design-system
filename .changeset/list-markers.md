---
'@arun-dev/ui': major
---

The reset keeps list markers. A `<ul>` or `<ol>` now shows its bullets or numbers, with `padding-inline-start: var(--space-lg)`, because in running text they're part of the content. Before, the reset removed them from every list.

**Migrating:** a list used for layout — a nav, a row of cards or tags — opts out with `role="list"`:

```html
<ul role="list">
  …
</ul>
```

`role="list"` also keeps the list announced as a list by VoiceOver in Safari, which can drop the semantics of a list styled with `list-style: none`. `Stack` and `Grid` rendered as a list remove the markers themselves, as `Breadcrumb` and `Pagination` already did.
