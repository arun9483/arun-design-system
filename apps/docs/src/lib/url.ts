/**
 * Resolves an internal path against the site's base.
 *
 * Starlight prefixes the base for sidebar entries, because it builds those from slugs.
 * A path written by hand gets no such treatment: `/headless/engine/` resolves to the
 * domain root, which is a 404 wherever the site is served from a subdirectory — as it
 * is on GitHub Pages, where the base is the repository name.
 *
 * @example docsUrl('/headless/engine/') // '/arun-design-system/headless/engine/'
 */
export function docsUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
