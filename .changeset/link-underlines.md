---
'@arun-dev/ui': minor
---

The reset no longer removes link underlines. In running text the underline is what tells a link apart from the words around it; without it, links differed by colour alone, which fails WCAG 1.4.1 in every app loading the reset. Links in other shapes — Chip, Card, Menu items, Breadcrumb, Pagination, Button — still have none. A link styled your own way that should not be underlined needs `text-decoration: none`.
