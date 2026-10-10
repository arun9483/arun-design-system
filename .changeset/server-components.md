---
'@arun-dev/headless': patch
'@arun-dev/ui': patch
---

Work in React Server Components. A Next.js App Router page importing `@arun-dev/ui` failed to build with `createContext is not a function`, because modules that use client-only React ran on the server. Every module that creates a context, calls a hook, or wraps a stateful headless component is now a `'use client'` module, and both packages build one file per module so the directive stays. Presentational components — `Card`, `Chip`, `Badge`, `Heading`, `Link`, `Button` and the rest — remain server components and add no JavaScript. Namespaces such as `Dialog` are still used as `<Dialog.Root>` in a server component.
