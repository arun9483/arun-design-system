---
'@arun-dev/ui': minor
---

Export the props types for the components this package defines — `ButtonProps`, `CardProps`,
`ChipProps`, `BadgeProps` — along with the `ButtonVariant` and `ChipVariant` value unions that
already had an exported counterpart in `BadgeTone`. Naming a wrapper's props no longer needs
`ComponentProps<typeof Button>`.

`Switch` is unchanged: its props types are defined by `@arun-dev/headless`, and re-exporting them
would freeze a relationship that is allowed to change. Derive them with
`ComponentProps<typeof Switch.Root>`. See `docs/architecture.md` decision 6.
