---
'@arun-dev/headless': minor
---

Add Combobox: a text input that filters a list, with single or multiple selection.

`@arun-dev/headless/combobox` exports `Combobox.Root`, `Input`, `Trigger`, `Clear`, `Popup`, `List`,
`Item`, `Empty`, `Status`, `Chip` and `ChipRemove`, and `defaultFilter`. Items are data: the Root
takes `items`, and `List` renders the filtered ones through a function. `value` holds items, so a
selection survives a search that no longer returns it.

`filter` takes the whole list, so a consumer's fuzzy search can rank; the default matches labels
ignoring case and accents, and `filter={null}` leaves filtering to a server. `onLoadMore` and
`loading` load more as the list scrolls to its end; `onItemHighlighted` lets a virtualizer follow
the highlight. Change callbacks receive `{ reason }`.

Behaviour follows Base UI's Combobox: a pick closes the list, and with `multiple` clears the query;
Clear empties the input and the selection. The popup is a native `popover="manual"`, anchored to
the input with CSS anchor positioning.
