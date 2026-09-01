/**
 * Prefixes the site's base onto root-absolute links written in content.
 *
 * Starlight resolves the base for sidebar entries, because it builds those from slugs.
 * A link written by hand gets no such treatment, so `[x](/headless/)` points at the
 * domain root — a 404 wherever the site is served from a subdirectory, as it is on
 * GitHub Pages.
 *
 * Doing it here rather than at each call site keeps markdown links as markdown. Writing
 * them as JSX would work, but MDX treats a line-leading `<a` as a block element, and
 * prose reflows, so an inline anchor cannot be kept off the start of a line.
 */
export function rehypeBaseUrl({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');
  if (prefix === '') return () => {};

  const rewrite = (node) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const href = node.properties?.href;
      // Root-absolute only: leave external, protocol-relative, hash and relative links.
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        if (!href.startsWith(`${prefix}/`)) node.properties.href = prefix + href;
      }
    }
    for (const child of node.children ?? []) rewrite(child);
  };

  return (tree) => rewrite(tree);
}
